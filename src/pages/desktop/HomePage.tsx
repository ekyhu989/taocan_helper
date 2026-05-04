import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, FolderOpen, Package, Calculator, ShoppingCart, Star, Heart, BarChart3, CheckSquare, Square } from 'lucide-react';
import { Button } from '../../components/common';
import { Card } from '../../components/common';
import TemplateSelector from '../../components/template/TemplateSelector';
import OnboardingGuide from '../../components/guide/OnboardingGuide';
import SolutionComparator from '../../components/solution/SolutionComparator';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useFavorites } from '../../hooks/useFavorites';
import { useSolutionHistory } from '../../hooks/useSolutionHistory';

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
  path: string;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const { isActive, currentStep, nextStep, skipGuide } = useOnboarding();
  const { items: favoriteItems } = useFavorites();
  const recentFavorites = favoriteItems.slice(0, 5);
  const { items: solutionItems } = useSolutionHistory();
  const recentSolutions = solutionItems.slice(0, 6);
  const [selectedSolutionIds, setSelectedSolutionIds] = useState<Set<string>>(new Set());
  const [showCompareModal, setShowCompareModal] = useState(false);

  const toggleSolutionSelect = (id: string) => {
    setSelectedSolutionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  const compareSolutions = recentSolutions.filter((s) =>
    selectedSolutionIds.has(s.id)
  );

  const features: FeatureItem[] = [
    {
      icon: FileEdit,
      title: '制定采购方案',
      description: 'AI智能生成采购方案',
      path: '/solution',
      buttonText: '开始制定',
      buttonVariant: 'primary',
    },
    {
      icon: FolderOpen,
      title: '政策文库',
      description: '海量政策文件检索',
      path: '/policies',
      buttonText: '浏览文库',
      buttonVariant: 'secondary',
    },
    {
      icon: Package,
      title: '商品库',
      description: '丰富商品数据管理',
      path: '/product',
      buttonText: '查看商品',
      buttonVariant: 'secondary',
    },
    {
      icon: Calculator,
      title: '合规测算',
      description: '智能合规性测算',
      path: '/compliance',
      buttonText: '开始测算',
      buttonVariant: 'secondary',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="container py-[16px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[12px]">
              <div
                className="w-[40px] h-[40px] flex items-center justify-center rounded-md"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h1
                className="font-semibold"
                style={{
                  fontSize: 'var(--font-size-h2)',
                  color: 'var(--color-text-primary)',
                }}
              >
                淘仓助手{' '}
                <span
                  className="font-normal"
                  style={{
                    fontSize: 'var(--font-size-body2)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  V3.0
                </span>
              </h1>
            </div>
            <Button
              variant="ghost"
              size="small"
              onClick={() => navigate('/favorites')}
              aria-label="我的收藏"
            >
              <Star className="w-5 h-5 mr-[4px] text-warning" />
              收藏夹
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-[48px] md:py-[64px]" style={{ backgroundColor: 'var(--color-bg-light)' }}>
        <div className="container text-center">
          <h2
            className="font-semibold mb-[16px]"
            style={{
              fontSize: 'var(--font-size-h1)',
              lineHeight: 'var(--line-height-h1)',
              color: 'var(--color-primary)',
            }}
          >
            新疆地区智能采购助手
          </h2>
          <p
            className="max-w-2xl mx-auto mb-[32px]"
            style={{
              fontSize: 'var(--font-size-body1)',
              color: 'var(--color-text-secondary)',
            }}
          >
            快速生成合规的采购方案
          </p>
          <Button
            variant="primary"
            size="large"
            onClick={() => setIsSelectorOpen(true)}
            data-guide-step="1"
          >
            <FileEdit className="w-5 h-5 mr-2" />
            立即制定方案
          </Button>
        </div>
      </section>

      {/* 我的收藏快捷访问 */}
      {recentFavorites.length > 0 && (
        <section className="container pt-[32px]">
          <div className="flex items-center gap-[8px] mb-[16px]">
            <Heart className="w-5 h-5 text-error" />
            <h2
              className="font-medium"
              style={{
                fontSize: 'var(--font-size-h3)',
                color: 'var(--color-text-primary)',
              }}
            >
              我的收藏
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[12px]">
            {recentFavorites.map((item) => (
              <Card
                key={item.id}
                variant="hover"
                className="cursor-pointer p-[12px]"
                onClick={() =>
                  navigate(
                    item.type === 'policy'
                      ? `/policy/${item.id}`
                      : '/templates'
                  )
                }
              >
                <div className="flex items-center gap-[8px]">
                  <Star className="w-4 h-4 text-warning fill-warning flex-shrink-0" />
                  <span
                    className="font-medium truncate"
                    style={{
                      fontSize: 'var(--font-size-body2)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {item.title}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 最近方案 */}
      {recentSolutions.length > 0 && (
        <section className="container pt-[32px]">
          <div className="flex items-center justify-between mb-[16px]">
            <div className="flex items-center gap-[8px]">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2
                className="font-medium"
                style={{
                  fontSize: 'var(--font-size-h3)',
                  color: 'var(--color-text-primary)',
                }}
              >
                最近方案
              </h2>
            </div>
            {selectedSolutionIds.size >= 2 && (
              <Button
                variant="primary"
                size="small"
                onClick={() => setShowCompareModal(true)}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                对比选中方案 ({selectedSolutionIds.size})
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[12px]">
            {recentSolutions.map((item) => {
              const isSelected = selectedSolutionIds.has(item.id);
              return (
                <Card
                  key={item.id}
                  variant="hover"
                  className={`cursor-pointer p-[12px] ${isSelected ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => toggleSolutionSelect(item.id)}
                >
                  <div className="flex items-center gap-[8px]">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-text-helper flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span
                        className="font-medium truncate block"
                        style={{
                          fontSize: 'var(--font-size-body2)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {item.templateName}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--font-size-caption)',
                          color: 'var(--color-text-helper)',
                        }}
                      >
                        {new Date(item.exportedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="container py-[48px] flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.path}
                variant="hover"
                onClick={() => navigate(feature.path)}
                className="cursor-pointer"
              >
                <div className="flex flex-col items-center text-center py-[16px]">
                  <div
                    className="w-[48px] h-[48px] flex items-center justify-center rounded-md mb-[16px]"
                    style={{ backgroundColor: 'var(--color-bg-light)' }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: 'var(--color-primary)' }}
                    />
                  </div>
                  <h3
                    className="font-medium mb-[8px]"
                    style={{
                      fontSize: 'var(--font-size-h3)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="mb-[24px]"
                    style={{
                      fontSize: 'var(--font-size-body2)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {feature.description}
                  </p>
                  <Button
                    variant={feature.buttonVariant}
                    size="medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(feature.path);
                    }}
                  >
                    {feature.buttonText}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Template Selector */}
      <TemplateSelector
        open={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={(template) => {
          // 埋点统计、日志记录等
          console.log('[Analytics] User selected template:', template.id, template.name);
        }}
      />

      {/* 新手引导 - 第1步 */}
      {isActive && currentStep === 1 && (
        <OnboardingGuide
          currentStep={currentStep}
          onNext={nextStep}
          onSkip={skipGuide}
        />
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <SolutionComparator
          open={showCompareModal}
          solutions={compareSolutions}
          onClose={() => {
            setShowCompareModal(false);
            setSelectedSolutionIds(new Set());
          }}
        />
      )}

      {/* Footer */}
      <footer
        className="border-t bg-white"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="container py-[24px] text-center"
          style={{
            fontSize: 'var(--font-size-caption)',
            color: 'var(--color-text-helper)',
          }}
        >
          版本 v3.0 | 新疆地区政府采购智能助手
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
