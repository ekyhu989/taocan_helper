#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
新项目初始化脚本
自动替换角色配置中的占位符，完成新项目配置
"""

import json
import os
import sys
from pathlib import Path

class ProjectInitializer:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.roles_dir = self.project_root / '.agent' / 'roles'
        self.config = {}
        
    def collect_project_info(self):
        """收集项目基本信息"""
        print("=" * 60)
        print("🚀 新项目初始化向导")
        print("=" * 60)
        print()
        
        # 项目基本信息
        self.config['project_name'] = input("📝 项目名称: ").strip()
        self.config['project_desc'] = input("📝 项目简介: ").strip()
        
        # 技术栈
        print("\n🔧 技术栈配置:")
        self.config['backend_framework'] = input("  后端框架 (如: Node.js, Spring Boot, Django): ").strip()
        self.config['frontend_framework'] = input("  前端框架 (如: Vue3, React, Angular): ").strip()
        self.config['database'] = input("  数据库 (如: MySQL, PostgreSQL, MongoDB): ").strip()
        self.config['deploy_platform'] = input("  部署平台 (如: AWS, 腾讯云, Vercel): ").strip()
        self.config['ui_library'] = input("  UI库 (如: Element Plus, Ant Design, Material-UI): ").strip()
        
        # CI/CD
        print("\n🚚 CI/CD配置:")
        self.config['ci_cd_tool'] = input("  CI/CD工具 (如: GitHub Actions, Jenkins, GitLab CI): ").strip()
        self.config['release_type'] = input("  发布类型 (如: Web应用, 小程序, 桌面应用): ").strip()
        
        # 设计规范
        print("\n🎨 设计规范:")
        self.config['primary_color'] = input("  主色调 (如: #1890ff): ").strip()
        self.config['font_family'] = input("  字体 (如: PingFang SC, Microsoft YaHei): ").strip()
        self.config['border_radius'] = input("  圆角 (如: 4px): ").strip()
        
        print("\n" + "=" * 60)
        print("✅ 信息收集完成，开始配置...")
        print("=" * 60)
        
    def replace_placeholders(self, content):
        """替换占位符"""
        replacements = {
            '[项目名称]': self.config['project_name'],
            '[项目简介]': self.config['project_desc'],
            '[后端框架]': self.config['backend_framework'],
            '[前端框架]': self.config['frontend_framework'],
            '[数据库]': self.config['database'],
            '[部署平台]': self.config['deploy_platform'],
            '[UI库]': self.config['ui_library'],
            '[CI/CD工具]': self.config['ci_cd_tool'],
            '[发布类型]': self.config['release_type'],
            '[主色调]': self.config['primary_color'],
            '[字体]': self.config['font_family'],
            '[圆角]': self.config['border_radius'],
        }
        
        for placeholder, value in replacements.items():
            content = content.replace(placeholder, value)
        
        return content
    
    def update_role_config(self, role_file):
        """更新角色配置文件"""
        file_path = self.roles_dir / role_file
        
        if not file_path.exists():
            print(f"⚠️  跳过: {role_file} (不存在)")
            return False
        
        # 读取文件
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 替换占位符
        new_content = self.replace_placeholders(content)
        
        # 验证JSON
        try:
            json.loads(new_content)
        except json.JSONDecodeError as e:
            print(f"❌ {role_file}: JSON验证失败 - {e}")
            return False
        
        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ {role_file}: 已更新")
        return True
    
    def update_all_roles(self):
        """更新所有角色配置"""
        print("\n📋 更新角色配置:")
        
        role_files = [
            'product-manager.json',
            'designer.json',
            'developer.json',
            'devops.json',
            'qa-engineer.json'
        ]
        
        success_count = 0
        for role_file in role_files:
            if self.update_role_config(role_file):
                success_count += 1
        
        print(f"\n✅ 成功更新 {success_count}/{len(role_files)} 个角色配置")
        return success_count == len(role_files)
    
    def generate_project_config(self):
        """生成项目配置文件"""
        print("\n📋 生成项目配置文件:")
        
        config_file = self.project_root / '.agent' / 'project-config.json'
        
        project_config = {
            "project_name": self.config['project_name'],
            "project_desc": self.config['project_desc'],
            "tech_stack": {
                "backend": self.config['backend_framework'],
                "frontend": self.config['frontend_framework'],
                "database": self.config['database'],
                "ui_library": self.config['ui_library']
            },
            "deployment": {
                "platform": self.config['deploy_platform'],
                "ci_cd": self.config['ci_cd_tool'],
                "release_type": self.config['release_type']
            },
            "design": {
                "primary_color": self.config['primary_color'],
                "font_family": self.config['font_family'],
                "border_radius": self.config['border_radius']
            },
            "initialized_at": "2026-05-01"
        }
        
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(project_config, f, indent=2, ensure_ascii=False)
        
        print(f"✅ 已生成 .agent/project-config.json")
    
    def verify_configuration(self):
        """验证配置完整性"""
        print("\n🔍 验证配置:")
        
        # 检查是否还有占位符
        placeholder_count = 0
        for role_file in self.roles_dir.glob('*.json'):
            with open(role_file, 'r', encoding='utf-8') as f:
                content = f.read()
                if '[' in content and ']' in content:
                    # 检查是否还有我们的占位符
                    placeholders = ['[项目名称]', '[项目简介]', '[前端框架]', '[后端框架]', 
                                  '[数据库]', '[部署平台]', '[主色调]', '[字体]', '[圆角]',
                                  '[UI库]', '[CI/CD工具]', '[发布类型]']
                    for p in placeholders:
                        if p in content:
                            placeholder_count += 1
                            print(f"⚠️  {role_file.name}: 仍有占位符 {p}")
        
        if placeholder_count == 0:
            print("✅ 所有占位符已替换")
        else:
            print(f"⚠️  发现 {placeholder_count} 个未替换的占位符")
        
        # 验证JSON语法
        json_valid = True
        for role_file in self.roles_dir.glob('*.json'):
            try:
                with open(role_file, 'r', encoding='utf-8') as f:
                    json.load(f)
            except json.JSONDecodeError as e:
                print(f"❌ {role_file.name}: JSON语法错误 - {e}")
                json_valid = False
        
        if json_valid:
            print("✅ 所有角色配置JSON语法正确")
        
        return placeholder_count == 0 and json_valid
    
    def run(self):
        """执行初始化"""
        try:
            # 收集信息
            self.collect_project_info()
            
            # 更新角色配置
            roles_updated = self.update_all_roles()
            
            # 生成项目配置
            self.generate_project_config()
            
            # 验证配置
            config_valid = self.verify_configuration()
            
            # 总结
            print("\n" + "=" * 60)
            if roles_updated and config_valid:
                print("🎉 初始化成功！项目已就绪，可以开始开发！")
                print("=" * 60)
                print(f"\n项目名称: {self.config['project_name']}")
                print(f"技术栈: {self.config['backend_framework']} + {self.config['frontend_framework']}")
                print(f"部署平台: {self.config['deploy_platform']}")
                print(f"\n下一步: 开始编写需求文档或设计文档")
            else:
                print("⚠️  初始化完成，但存在一些问题，请检查上方输出")
                print("=" * 60)
            
        except KeyboardInterrupt:
            print("\n\n❌ 初始化已取消")
            sys.exit(1)
        except Exception as e:
            print(f"\n❌ 初始化失败: {e}")
            sys.exit(1)

if __name__ == '__main__':
    project_root = Path(__file__).parent
    initializer = ProjectInitializer(project_root)
    initializer.run()
