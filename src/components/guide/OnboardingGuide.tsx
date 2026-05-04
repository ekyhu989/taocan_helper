import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '../common';

interface StepConfig {
  targetSelector?: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const steps: StepConfig[] = [
  {
    targetSelector: '[data-guide-step="1"]',
    title: '第一步',
    description: '选择适合的采购方案模板，点击"立即制定方案"开始',
    placement: 'bottom',
  },
  {
    targetSelector: '[data-guide-step="2"]',
    title: '第二步',
    description: '填写采购信息，系统每30秒自动保存草稿',
    placement: 'right',
  },
  {
    targetSelector: '[data-guide-step="3"]',
    title: '第三步',
    description: '导出Word/PDF方案，直接提交审批',
    placement: 'top',
  },
];

interface OnboardingGuideProps {
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  currentStep,
  onNext,
  onSkip,
}) => {
  const [targetRect, setTargetRect] = useState<Rect | null>(null);

  const step = steps[currentStep - 1];

  const updateTargetRect = useCallback(() => {
    if (!step?.targetSelector) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [updateTargetRect]);

  // 键盘事件：右箭头下一步，ESC跳过
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'Escape') {
        onSkip();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNext, onSkip]);

  if (!step) return null;

  const hasTarget = targetRect !== null;

  // 提示卡片位置
  const getTooltipStyle = (): React.CSSProperties => {
    if (!hasTarget || !targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60,
      };
    }

    const placement = step.placement || 'bottom';
    const spacing = 12;
    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = targetRect.top - spacing;
        left = targetRect.left + targetRect.width / 2;
        return {
          position: 'absolute',
          top,
          left,
          transform: 'translate(-50%, -100%)',
          zIndex: 60,
        };
      case 'bottom':
        top = targetRect.top + targetRect.height + spacing;
        left = targetRect.left + targetRect.width / 2;
        return {
          position: 'absolute',
          top,
          left,
          transform: 'translate(-50%, 0)',
          zIndex: 60,
        };
      case 'left':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.left - spacing;
        return {
          position: 'absolute',
          top,
          left,
          transform: 'translate(-100%, -50%)',
          zIndex: 60,
        };
      case 'right':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.left + targetRect.width + spacing;
        return {
          position: 'absolute',
          top,
          left,
          transform: 'translate(0, -50%)',
          zIndex: 60,
        };
      default:
        return {};
    }
  };

  const tooltipStyle = getTooltipStyle();

  return createPortal(
    <div className="fixed inset-0 z-50" style={{ pointerEvents: 'auto' }}>
      {/* 蒙层 - 使用4个div覆盖目标元素周围 */}
      {hasTarget && targetRect && (
        <>
          <div
            className="fixed bg-black/50"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: targetRect.top,
            }}
          />
          <div
            className="fixed bg-black/50"
            style={{
              top: targetRect.top,
              left: 0,
              width: targetRect.left,
              height: targetRect.height,
            }}
          />
          <div
            className="fixed bg-black/50"
            style={{
              top: targetRect.top,
              left: targetRect.left + targetRect.width,
              right: 0,
              height: targetRect.height,
            }}
          />
          <div
            className="fixed bg-black/50"
            style={{
              top: targetRect.top + targetRect.height,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          {/* 高亮边框 */}
          <div
            className="absolute border-2 border-primary rounded-md"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              boxShadow: '0 0 0 4px rgba(30, 58, 95, 0.2)',
              zIndex: 55,
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* 无目标时的全屏蒙层 */}
      {!hasTarget && (
        <div className="fixed inset-0 bg-black/50" />
      )}

      {/* 提示卡片 */}
      <div style={tooltipStyle}>
        <div className="bg-white rounded-lg shadow-xl p-[20px] w-[320px]">
          <div className="flex items-center justify-between mb-[12px]">
            <span
              className="font-medium"
              style={{
                fontSize: 'var(--font-size-h3)',
                color: 'var(--color-primary)',
              }}
            >
              {step.title}
            </span>
            <button
              onClick={onSkip}
              className="p-1 rounded-sm hover:bg-bg-light transition-colors"
              aria-label="跳过引导"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          <p
            className="mb-[20px]"
            style={{
              fontSize: 'var(--font-size-body1)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--line-height-body)',
            }}
          >
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[6px]">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className="w-[8px] h-[8px] rounded-full"
                  style={{
                    backgroundColor:
                      idx + 1 === currentStep
                        ? 'var(--color-primary)'
                        : 'var(--color-border)',
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-[8px]">
              <Button variant="ghost" size="small" onClick={onSkip}>
                跳过引导
              </Button>
              <Button variant="primary" size="small" onClick={onNext}>
                {currentStep === steps.length ? '完成' : '下一步'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          <p
            className="mt-[12px] text-center"
            style={{
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-text-helper)',
            }}
          >
            按右箭头键下一步，ESC键跳过
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OnboardingGuide;
