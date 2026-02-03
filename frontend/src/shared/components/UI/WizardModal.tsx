import React, { useState } from 'react';
import Modal from './Modal';
import {
    ChevronRightIcon,
    ChevronLeftIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface WizardStep {
    title: string;
    component: React.ReactNode;
    isValid?: boolean;
}

interface WizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title: string;
    steps: WizardStep[];
    submitLabel?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const WizardModal: React.FC<WizardModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    steps,
    submitLabel = "Terminer",
    size = "lg"
}) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
            <div className="flex flex-col h-full max-h-[85vh]">
                {/* Step Progress Bar */}
                <div className="flex items-center justify-between mb-8 px-2">
                    {steps.map((step, idx) => (
                        <React.Fragment key={idx}>
                            <div className="flex flex-col items-center relative z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${idx <= currentStep
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                        : 'bg-white border-slate-200 text-slate-400'
                                    }`}>
                                    {idx < currentStep ? <CheckCircleIcon className="h-6 w-6" /> : (idx + 1)}
                                </div>
                                <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider absolute -bottom-5 w-max ${idx <= currentStep ? 'text-blue-600' : 'text-slate-400'
                                    }`}>
                                    {step.title}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${idx < currentStep ? 'bg-blue-600' : 'bg-slate-200'
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto mt-8 py-4 px-2 min-h-[300px]">
                    {steps[currentStep].component}
                </div>

                {/* Action Footer */}
                <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentStep === 0
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <ChevronLeftIcon className="h-4 w-4 mr-2" />
                        Précédent
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={steps[currentStep].isValid === false}
                        className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all ${steps[currentStep].isValid === false
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-900 text-white hover:bg-black hover:shadow-md'
                            }`}
                    >
                        {currentStep === steps.length - 1 ? submitLabel : 'Suivant'}
                        {currentStep < steps.length - 1 && <ChevronRightIcon className="h-4 w-4 ml-2" />}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default WizardModal;
