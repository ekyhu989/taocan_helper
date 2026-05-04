import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Tag,
  Shield,
  Star,
  Download,
  CheckCircle,
} from 'lucide-react';
import { Button, Card } from '../common';
import type { Policy } from '../../types/policy.types';

interface PolicyViewerProps {
  policy: Policy;
  onToggleFavorite?: (policy: Policy) => void;
  onDownload?: (policy: Policy) => void;
}

const categoryLabels: Record<string, string> = {
  national: '国家政策',
  local: '地方政策',
  industry: '行业规范',
};

const levelLabels: Record<string, string> = {
  mandatory: '强制',
  suggestion: '建议',
  reference: '参考',
};

const levelIcons: Record<string, React.ReactNode> = {
  mandatory: <Shield className="w-4 h-4" />,
  suggestion: <CheckCircle className="w-4 h-4" />,
  reference: <FileText className="w-4 h-4" />,
};

const levelColors: Record<string, string> = {
  mandatory: 'text-error',
  suggestion: 'text-warning',
  reference: 'text-text-secondary',
};

const PolicyViewer: React.FC<PolicyViewerProps> = ({
  policy,
  onToggleFavorite,
  onDownload,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'keyPoints'>('content');

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // 滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [policy.id]);

  return (
    <div className="space-y-[24px]">
      {/* 头部信息 */}
      <Card>
        <div className="flex flex-col gap-[16px]">
          {/* 标题与操作 */}
          <div className="flex items-start justify-between gap-[16px]">
            <h1
              className="font-bold flex-1"
              style={{
                fontSize: 'var(--font-size-h2)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--line-height-head)',
              }}
            >
              {policy.title}
            </h1>
            <div className="flex gap-[8px] shrink-0">
              <Button
                variant={policy.isFavorite ? 'primary' : 'ghost'}
                size="small"
                onClick={() => onToggleFavorite?.(policy)}
                aria-label={policy.isFavorite ? '取消收藏' : '收藏'}
              >
                <Star
                  className={`w-4 h-4 mr-[4px] ${
                    policy.isFavorite ? 'fill-white' : ''
                  }`}
                />
                {policy.isFavorite ? '已收藏' : '收藏'}
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => onDownload?.(policy)}
              >
                <Download className="w-4 h-4 mr-[4px]" />
                下载
              </Button>
            </div>
          </div>

          {/* 元信息标签 */}
          <div className="flex flex-wrap gap-[12px]">
            <span
              className="inline-flex items-center gap-[4px] px-[10px] py-[4px] rounded-sm bg-info/10 text-info"
              style={{ fontSize: 'var(--font-size-body2)' }}
            >
              <Tag className="w-4 h-4" />
              {categoryLabels[policy.category] || policy.category}
            </span>

            <span
              className={`inline-flex items-center gap-[4px] px-[10px] py-[4px] rounded-sm ${levelColors[policy.level]}`}
              style={{ fontSize: 'var(--font-size-body2)' }}
            >
              {levelIcons[policy.level]}
              合规等级：{levelLabels[policy.level] || policy.level}
            </span>

            <span
              className="inline-flex items-center gap-[4px] px-[10px] py-[4px] rounded-sm bg-text-secondary/10 text-text-secondary"
              style={{ fontSize: 'var(--font-size-body2)' }}
            >
              <Calendar className="w-4 h-4" />
              {policy.year}年
            </span>

            <span
              className="inline-flex items-center gap-[4px] px-[10px] py-[4px] rounded-sm bg-text-secondary/10 text-text-secondary"
              style={{ fontSize: 'var(--font-size-body2)' }}
            >
              <FileText className="w-4 h-4" />
              {formatFileSize(policy.fileSize)} · {policy.fileType.toUpperCase()}
            </span>
          </div>

          {/* 摘要 */}
          <p
            className="p-[12px] bg-bg-light rounded-sm"
            style={{
              fontSize: 'var(--font-size-body1)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--line-height-body)',
            }}
          >
            {policy.summary}
          </p>
        </div>
      </Card>

      {/* Tab 切换 */}
      <div className="flex gap-[4px] border-b border-border-light">
        <button
          className={`px-[16px] py-[10px] font-medium transition-colors relative ${
            activeTab === 'content'
              ? 'text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('content')}
          style={{ fontSize: 'var(--font-size-body1)' }}
          aria-selected={activeTab === 'content'}
          role="tab"
        >
          政策内容
          {activeTab === 'content' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
          )}
        </button>
        <button
          className={`px-[16px] py-[10px] font-medium transition-colors relative ${
            activeTab === 'keyPoints'
              ? 'text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('keyPoints')}
          style={{ fontSize: 'var(--font-size-body1)' }}
          aria-selected={activeTab === 'keyPoints'}
          role="tab"
        >
          合规要点
          <span className="ml-[6px] px-[6px] py-[2px] rounded-full bg-primary text-white text-[12px]">
            {policy.keyPoints.length}
          </span>
          {activeTab === 'keyPoints' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
          )}
        </button>
      </div>

      {/* Tab 内容 */}
      <div role="tabpanel">
        {activeTab === 'content' ? (
          <Card>
            <div className="whitespace-pre-wrap leading-relaxed">
              {policy.content.split('\n').map((line, index) => {
                // 匹配"第X条"或"X、"开头的行作为标题样式
                const isHeading =
                  /^[一二三四五六七八九十]+、/.test(line) ||
                  /^(第[一二三四五六七八九十]+条)/.test(line);

                if (isHeading) {
                  return (
                    <h3
                      key={index}
                      className="font-semibold mt-[16px] mb-[8px]"
                      style={{
                        fontSize: 'var(--font-size-h3)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {line}
                    </h3>
                  );
                }

                if (line.trim() === '') {
                  return <div key={index} className="h-[8px]" />;
                }

                return (
                  <p
                    key={index}
                    className="mb-[8px]"
                    style={{
                      fontSize: 'var(--font-size-body1)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 'var(--line-height-body)',
                    }}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card>
            <ul className="space-y-[12px]">
              {policy.keyPoints.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-[10px] p-[12px] rounded-sm bg-bg-light"
                >
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-[2px]" />
                  <span
                    style={{
                      fontSize: 'var(--font-size-body1)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 'var(--line-height-body)',
                    }}
                  >
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PolicyViewer;
