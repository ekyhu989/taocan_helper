import { useState, useEffect, useCallback } from 'react';
import { POLICY_VERSION, checkPolicyVersion, confirmPolicyVersion } from '../data/policies';
import PolicyUpdateModal from '../components/PolicyUpdateModal';

/**
 * 政策版本校验 Hook
 * 
 * 功能：
 * 1. 检查当前政策版本是否已确认
 * 2. 提供确认版本的方法
 * 3. 管理强制更新弹窗状态
 * 4. 拦截未确认版本时的核心操作
 */

export const usePolicyVersion = () => {
  const [isVersionValid, setIsVersionValid] = useState(true);
  const [confirmedVersion, setConfirmedVersion] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [shouldBlockAction, setShouldBlockAction] = useState(false);

  // 初始化时检查版本
  useEffect(() => {
    const versionValid = checkPolicyVersion();
    setIsVersionValid(versionValid);
    setShouldBlockAction(!versionValid);
    
    const storedVersion = localStorage.getItem('policy_confirmed_version');
    setConfirmedVersion(storedVersion);
    
    // 如果版本未确认，显示弹窗
    if (!versionValid) {
      setShowUpdateModal(true);
    }
  }, []);

  const checkVersion = useCallback(() => {
    const valid = checkPolicyVersion();
    setIsVersionValid(valid);
    setShouldBlockAction(!valid);
    return valid;
  }, []);

  const confirmVersion = useCallback(() => {
    confirmPolicyVersion();
    setIsVersionValid(true);
    setShouldBlockAction(false);
    setShowUpdateModal(false);
    setConfirmedVersion(POLICY_VERSION);
  }, []);

  const showModal = useCallback(() => {
    setShowUpdateModal(true);
  }, []);

  const hideModal = useCallback(() => {
    setShowUpdateModal(false);
  }, []);

  const beforeAction = useCallback(() => {
    const valid = checkPolicyVersion();
    if (!valid) {
      setShowUpdateModal(true);
      return false;
    }
    return true;
  }, []);

  const clearConfirmedVersion = useCallback(() => {
    localStorage.removeItem('policy_confirmed_version');
    setIsVersionValid(false);
    setShouldBlockAction(true);
    setConfirmedVersion(null);
    setShowUpdateModal(true);
  }, []);

  return {
    // 状态
    isVersionValid,
    currentVersion: POLICY_VERSION,
    confirmedVersion,
    showUpdateModal,
    shouldBlockAction,
    
    // 操作
    checkVersion,
    confirmVersion,
    showModal,
    hideModal,
    beforeAction,
    clearConfirmedVersion,
  };
};

/**
 * 高阶组件：版本校验拦截器
 * 
 * 用法：
 * ```jsx
 * const ProtectedComponent = withPolicyVersionCheck(MyComponent);
 * ```
 */
export const withPolicyVersionCheck = (WrappedComponent) => {
  const WithPolicyVersionCheck = (props) => {
    const { beforeAction, showUpdateModal, confirmVersion } = usePolicyVersion();
    
    // 拦截所有操作
    const handleAction = (action) => {
      if (beforeAction()) {
        action();
      }
    };

    return (
      <>
        <WrappedComponent 
          {...props} 
          onAction={handleAction}
        />
        {showUpdateModal && (
          <PolicyUpdateModal 
            isOpen={showUpdateModal}
            onConfirm={confirmVersion}
            onViewUpdates={() => {
              // 跳转到新疆财政厅官网
              window.open('http://czt.xinjiang.gov.cn', '_blank', 'noopener,noreferrer');
            }}
          />
        )}
      </>
    );
  };
  
  WithPolicyVersionCheck.displayName = `WithPolicyVersionCheck(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithPolicyVersionCheck;
};