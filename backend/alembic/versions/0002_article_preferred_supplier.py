"""Ajoute Article.preferred_supplier_id — lien fournisseur habituel.

Sans cette colonne, une alerte de réapprovisionnement (stock sous le
seuil minimum) ne pouvait mener à aucune commande fournisseur créée
automatiquement : l'écran Inventaire se contentait de rediriger
l'utilisateur vers /fournisseurs, faute de savoir à qui commander.

Revision ID: 0002_article_supplier
Revises: 0001_baseline
Create Date: 2026-07-21
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002_article_supplier"
down_revision = "0001_baseline"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = {col["name"] for col in inspector.get_columns("articles")}
    if "preferred_supplier_id" not in existing_columns:
        op.add_column(
            "articles",
            sa.Column(
                "preferred_supplier_id",
                postgresql.UUID(as_uuid=True),
                sa.ForeignKey("fournisseurs.id"),
                nullable=True,
            ),
        )
        op.create_index(
            "ix_articles_preferred_supplier_id",
            "articles",
            ["preferred_supplier_id"],
        )


def downgrade() -> None:
    op.drop_index("ix_articles_preferred_supplier_id", table_name="articles")
    op.drop_column("articles", "preferred_supplier_id")
