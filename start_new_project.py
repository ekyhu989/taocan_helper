#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
一键初始化新项目
合并清理和配置两个步骤
"""

import sys
from pathlib import Path

def main():
    print("=" * 60)
    print("🚀 新项目一键初始化")
    print("=" * 60)
    print()
    
    project_root = Path(__file__).parent
    
    # 步骤1: 清理项目
    print("📋 步骤 1/2: 清理项目文件")
    print("-" * 60)
    
    from cleanup_project import ProjectCleaner
    cleaner = ProjectCleaner(project_root)
    cleanup_plan = cleaner.identify_cleanup_items()
    
    if cleanup_plan['directories'] or cleanup_plan['files']:
        print("\n⚡ 执行清理...")
        cleaner.execute_cleanup(cleanup_plan)
        print("✅ 清理完成")
    else:
        print("✅ 项目已是干净状态，无需清理")
    
    # 步骤2: 初始化配置
    print("\n" + "=" * 60)
    print("📋 步骤 2/2: 配置项目信息")
    print("-" * 60)
    
    from init_project import ProjectInitializer
    initializer = ProjectInitializer(project_root)
    initializer.run()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ 初始化已取消")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 初始化失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
