import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdmissionProgressTrackerProps {
  stages: string[];
  currentStageIndex: number;
}

const AdmissionProgressTracker = ({ stages, currentStageIndex }: AdmissionProgressTrackerProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Admission Process Status</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Your admission is currently in the highlighted stage.
        </p>
      </CardHeader>
      <CardContent>
        {/* Desktop: Horizontal Progress Bar */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Progress Line Background */}
            <div className="absolute top-5 left-[20px] right-[20px] h-1 bg-muted rounded-full" />
            
            {/* Progress Line Fill */}
            <div 
              className="absolute top-5 left-[20px] h-1 bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: currentStageIndex === 0 
                  ? '0%' 
                  : `calc(${(currentStageIndex / (stages.length - 1)) * 100}% - 40px * ${currentStageIndex / (stages.length - 1)})`
              }}
            />
            
            {/* Stages */}
            <div className="relative flex justify-between">
              {stages.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                
                return (
                  <div 
                    key={stage}
                    className="flex flex-col items-center"
                    style={{ width: `${100 / stages.length}%` }}
                  >
                    {/* Step Circle */}
                    <div 
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center z-10 
                        font-semibold text-sm transition-all duration-300
                        ${isCompleted 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : isCurrent 
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/25 shadow-lg scale-110" 
                            : "bg-muted text-muted-foreground border-2 border-muted-foreground/20"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" strokeWidth={3} />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Stage Label */}
                    <span 
                      className={`
                        text-[11px] text-center mt-3 leading-tight max-w-[90px] min-h-[32px]
                        ${isCurrent 
                          ? "text-primary font-semibold" 
                          : isCompleted
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }
                      `}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Progress Bar */}
        <div className="md:hidden">
          <div className="relative pl-8">
            {/* Vertical Line Background */}
            <div className="absolute left-[15px] top-[20px] bottom-[20px] w-1 bg-muted rounded-full" />
            
            {/* Vertical Line Fill */}
            <div 
              className="absolute left-[15px] top-[20px] w-1 bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ 
                height: currentStageIndex === 0 
                  ? '0%' 
                  : `calc(${(currentStageIndex / (stages.length - 1)) * 100}%)`
              }}
            />
            
            {/* Stages */}
            <div className="space-y-5">
              {stages.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                
                return (
                  <div 
                    key={stage}
                    className="relative flex items-start gap-4"
                  >
                    {/* Step Circle */}
                    <div 
                      className={`
                        absolute -left-8 w-8 h-8 rounded-full flex items-center justify-center z-10 
                        font-semibold text-xs transition-all duration-300 flex-shrink-0
                        ${isCompleted 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : isCurrent 
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/25 shadow-lg scale-110" 
                            : "bg-muted text-muted-foreground border-2 border-muted-foreground/20"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" strokeWidth={3} />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Stage Content */}
                    <div 
                      className={`
                        pt-1 min-h-[40px]
                        ${isCurrent 
                          ? "text-primary" 
                          : isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      `}
                    >
                      <span 
                        className={`
                          text-sm leading-tight block
                          ${isCurrent 
                            ? "font-semibold" 
                            : isCompleted
                              ? "font-medium"
                              : "font-normal"
                          }
                        `}
                      >
                        {stage}
                      </span>
                      {isCurrent && (
                        <span className="text-xs text-primary/80 mt-1 block">
                          Current Stage
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdmissionProgressTracker;
