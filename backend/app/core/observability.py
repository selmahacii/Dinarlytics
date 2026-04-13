"""
OpenTelemetry Configuration for Distributed Tracing

Provides:
- Automatic instrumentation of FastAPI, SQLAlchemy, requests
- OTLP exporter for Jaeger, Grafana Tempo, or other collectors
- Custom span instrumentation for business logic (AI predictions, etc.)

Requirements:
    pip install opentelemetry-api opentelemetry-sdk
    pip install opentelemetry-exporter-otlp
    pip install opentelemetry-instrumentation-fastapi
    pip install opentelemetry-instrumentation-sqlalchemy
"""

import logging
from typing import Optional

# Attempt import - gracefully handle if not installed
try:
    from opentelemetry import trace, metrics
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import SimpleSpanProcessor, BatchSpanProcessor
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
    from opentelemetry.instrumentation.requests import RequestsInstrumentor
    from opentelemetry.sdk.resources import Resource
    OTEL_AVAILABLE = True
except ImportError:
    OTEL_AVAILABLE = False

logger = logging.getLogger(__name__)


class ObservabilityConfig:
    """Configuration for OpenTelemetry tracing"""

    def __init__(self, app_name: str, app_version: str, environment: str):
        self.app_name = app_name
        self.app_version = app_version
        self.environment = environment
        self.tracer_provider: Optional[TracerProvider] = None
        self.tracer: Optional[trace.Tracer] = None

    def init_tracing(
        self,
        otlp_exporter_endpoint: str = "http://localhost:4317",
        traces_sample_rate: float = 1.0,
        batch_processing: bool = True,
    ) -> bool:
        """
        Initialize OpenTelemetry tracing

        Args:
            otlp_exporter_endpoint: OTLP collector endpoint (default: localhost Jaeger)
            traces_sample_rate: Sampling rate 0.0-1.0 (default: 1.0 = all traces)
            batch_processing: Use batch processor for better performance

        Returns:
            True if initialization successful, False if OpenTelemetry not available
        """
        if not OTEL_AVAILABLE:
            logger.warning("OpenTelemetry not installed. Install with: pip install opentelemetry-sdk opentelemetry-exporter-otlp")
            return False

        try:
            # Create resource with app metadata
            resource = Resource.create({
                "service.name": self.app_name,
                "service.version": self.app_version,
                "deployment.environment": self.environment,
            })

            # Create tracer provider
            self.tracer_provider = TracerProvider(resource=resource)

            # Create OTLP exporter
            otlp_exporter = OTLPSpanExporter(
                endpoint=otlp_exporter_endpoint,
                insecure=True,
                timeout=10,
            )

            # Add span processor
            if batch_processing:
                # Batch processor for better performance in production
                span_processor = BatchSpanProcessor(
                    otlp_exporter,
                    schedule_delay_millis=5000,  # 5 seconds
                    max_queue_size=2048,
                    max_export_batch_size=512,
                )
            else:
                # Simple processor for development (immediate export)
                span_processor = SimpleSpanProcessor(otlp_exporter)

            self.tracer_provider.add_span_processor(span_processor)

            # Set global tracer provider
            trace.set_tracer_provider(self.tracer_provider)

            # Get tracer for business logic instrumentation
            self.tracer = trace.get_tracer(__name__)

            logger.info(f"✅ OpenTelemetry initialized (endpoint: {otlp_exporter_endpoint})")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize OpenTelemetry: {e}")
            return False

    def instrument_fastapi(self, app) -> None:
        """Auto-instrument FastAPI application"""
        if not OTEL_AVAILABLE:
            return

        try:
            FastAPIInstrumentor.instrument_app(
                app,
                tracer_provider=self.tracer_provider,
                excluded_urls=["^/api/docs", "^/api/redoc", "^/api/openapi.json"],
            )
            logger.info("✅ FastAPI instrumented for OpenTelemetry")
        except Exception as e:
            logger.error(f"Failed to instrument FastAPI: {e}")

    def instrument_sqlalchemy(self, engine) -> None:
        """Auto-instrument SQLAlchemy database engine"""
        if not OTEL_AVAILABLE:
            return

        try:
            SQLAlchemyInstrumentor().instrument(
                engine=engine,
                service=self.app_name,
                tracer_provider=self.tracer_provider,
            )
            logger.info("✅ SQLAlchemy instrumented for OpenTelemetry")
        except Exception as e:
            logger.error(f"Failed to instrument SQLAlchemy: {e}")

    def instrument_requests(self) -> None:
        """Auto-instrument requests library"""
        if not OTEL_AVAILABLE:
            return

        try:
            RequestsInstrumentor().instrument(tracer_provider=self.tracer_provider)
            logger.info("✅ Requests library instrumented for OpenTelemetry")
        except Exception as e:
            logger.error(f"Failed to instrument requests: {e}")

    def create_span(self, name: str, attributes: dict = None):
        """
        Create a custom span for business logic instrumentation

        Usage:
            with observability.create_span("ai_predict", {"model": "erp_v1"}) as span:
                result = model.predict(data)
                span.set_attribute("prediction.risk", result["risk"])

        Args:
            name: Span name
            attributes: Initial span attributes

        Returns:
            Active span context
        """
        if not self.tracer:
            # Fallback: return null context manager if OpenTelemetry not initialized
            from contextlib import nullcontext
            return nullcontext()

        span = self.tracer.start_as_current_span(name)
        if attributes:
            for key, value in attributes.items():
                span.set_attribute(key, value)

        return span


# Global observability instance
observability: Optional[ObservabilityConfig] = None


def init_observability(app, settings) -> Optional[ObservabilityConfig]:
    """
    Initialize observability for the application

    Called from app/main.py during FastAPI app startup

    Args:
        app: FastAPI application instance
        settings: Application settings from config.py

    Returns:
        ObservabilityConfig instance or None if OpenTelemetry not available
    """
    global observability

    otel_enabled = getattr(settings, "OTEL_ENABLED", False)
    otel_endpoint = getattr(
        settings, "OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317"
    )

    if not otel_enabled:
        logger.info("OpenTelemetry tracing disabled (set OTEL_ENABLED=true to enable)")
        return None

    observability = ObservabilityConfig(
        app_name=settings.APP_NAME,
        app_version=settings.APP_VERSION,
        environment=settings.APP_ENVIRONMENT,
    )

    # Initialize tracing
    success = observability.init_tracing(
        otlp_exporter_endpoint=otel_endpoint,
        traces_sample_rate=1.0,
        batch_processing=settings.APP_ENVIRONMENT == "production",
    )

    if not success:
        return None

    # Instrument frameworks
    observability.instrument_fastapi(app)
    observability.instrument_sqlalchemy(getattr(settings, "_db_engine", None) or None)
    observability.instrument_requests()

    return observability


def get_tracer():
    """Get current tracer for business logic instrumentation"""
    return trace.get_tracer(__name__) if observability else None


__all__ = [
    "ObservabilityConfig",
    "init_observability",
    "get_tracer",
    "observability",
    "OTEL_AVAILABLE",
]
