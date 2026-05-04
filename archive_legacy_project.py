#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
旧项目自动归档脚本
扫描旧项目文件，自动分类归档到docs/09-归档/
生成项目现状报告，便于与PM直接沟通v2.0需求
"""

import os
import shutil
import json
from pathlib import Path
from datetime import datetime

class LegacyProjectArchiver:
    def __init__(self, project_root, legacy_project_path):
        self.project_root = Path(project_root)
        self.legacy_path = Path(legacy_project_path)
        self.archive_dir = self.project_root / 'docs' / '09-归档'
        self.report_data = {
            'project_name': self.legacy_path.name,
            'archive_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'statistics': {},
            'structure': {},
            'tech_stack': [],
            'dependencies': [],
            'key_files': []
        }
        
    def analyze_legacy_project(self):
        """分析旧项目结构"""
        print("=" * 60)
        print("🔍 分析旧项目结构")
        print("=" * 60)
        
        stats = {
            'total_files': 0,
            'total_dirs': 0,
            'total_size': 0,
            'file_types': {},
            'directories': {}
        }
        
        # 遍历所有文件
        for file_path in self.legacy_path.rglob('*'):
            if file_path.is_file():
                stats['total_files'] += 1
                stats['total_size'] += file_path.stat().st_size
                
                # 统计文件类型
                ext = file_path.suffix.lower()
                if ext:
                    stats['file_types'][ext] = stats['file_types'].get(ext, 0) + 1
                
                # 统计目录
                rel_dir = file_path.parent.relative_to(self.legacy_path)
                dir_name = str(rel_dir)
                if dir_name not in stats['directories']:
                    stats['directories'][dir_name] = 0
                stats['directories'][dir_name] += 1
        
        # 统计目录数量
        stats['total_dirs'] = len(stats['directories'])
        
        # 格式化大小
        size_mb = stats['total_size'] / (1024 * 1024)
        stats['total_size_mb'] = size_mb
        
        self.report_data['statistics'] = stats
        
        # 打印统计
        print(f"\n📊 项目统计:")
        print(f"  总文件数: {stats['total_files']}")
        print(f"  总目录数: {stats['total_dirs']}")
        print(f"  总大小: {size_mb:.2f} MB")
        
        print(f"\n📁 文件类型分布 (Top 10):")
        sorted_types = sorted(stats['file_types'].items(), key=lambda x: x[1], reverse=True)
        for ext, count in sorted_types[:10]:
            print(f"  {ext}: {count} 个文件")
        
        print(f"\n📂 主要目录:")
        sorted_dirs = sorted(stats['directories'].items(), key=lambda x: x[1], reverse=True)
        for dir_name, count in sorted_dirs[:10]:
            print(f"  {dir_name}/: {count} 个文件")
    
    def detect_tech_stack(self):
        """检测技术栈"""
        print("\n" + "=" * 60)
        print("🔧 检测技术栈")
        print("=" * 60)
        
        tech_indicators = {
            'Node.js': ['package.json', 'node_modules'],
            'Vue': ['vue.config.js', 'vite.config.js', '*.vue'],
            'React': ['package.json'],  # 需要检查dependencies
            '微信小程序': ['app.json', 'app.wxss', 'app.js'],
            'Python': ['requirements.txt', 'setup.py', '*.py'],
            'Java': ['pom.xml', 'build.gradle', '*.java'],
            'PHP': ['composer.json', '*.php'],
            'MySQL': ['*.sql', 'database.sql'],
            'MongoDB': ['mongodb.js', 'mongo.js'],
            'Docker': ['Dockerfile', 'docker-compose.yml'],
            'Git': ['.git'],
        }
        
        detected = []
        for tech, indicators in tech_indicators.items():
            for indicator in indicators:
                if indicator.startswith('*'):
                    # 检查文件扩展名
                    ext = indicator[1:]
                    if list(self.legacy_path.rglob(f'*{ext}')):
                        detected.append(tech)
                        break
                else:
                    # 检查文件/目录是否存在
                    if list(self.legacy_path.rglob(indicator)):
                        detected.append(tech)
                        break
        
        # 检查package.json中的dependencies
        package_json = self.legacy_path / 'package.json'
        if package_json.exists():
            try:
                with open(package_json, 'r', encoding='utf-8') as f:
                    pkg = json.load(f)
                    deps = pkg.get('dependencies', {})
                    if 'vue' in deps:
                        if 'Vue' not in detected:
                            detected.append('Vue')
                    if 'react' in deps:
                        if 'React' not in detected:
                            detected.append('React')
            except:
                pass
        
        self.report_data['tech_stack'] = detected
        
        if detected:
            print(f"\n✅ 检测到技术栈:")
            for tech in detected:
                print(f"  - {tech}")
        else:
            print(f"\n⚠️  未检测到明确的技术栈")
    
    def identify_key_files(self):
        """识别关键文件"""
        print("\n" + "=" * 60)
        print("🔑 识别关键文件")
        print("=" * 60)
        
        key_patterns = [
            ('README.md', '项目说明'),
            ('package.json', '依赖配置'),
            ('requirements.txt', 'Python依赖'),
            ('pom.xml', 'Maven配置'),
            ('app.json', '小程序配置'),
            ('database.sql', '数据库脚本'),
            ('*.sql', 'SQL文件'),
            ('.env', '环境变量'),
            ('config.*', '配置文件'),
        ]
        
        key_files = []
        for pattern, description in key_patterns:
            if pattern.startswith('*'):
                ext = pattern[1:]
                files = list(self.legacy_path.rglob(f'*{ext}'))
                for f in files[:3]:  # 最多取3个
                    rel_path = f.relative_to(self.legacy_path)
                    key_files.append({
                        'path': str(rel_path),
                        'type': description,
                        'size_kb': f.stat().st_size / 1024
                    })
            else:
                files = list(self.legacy_path.rglob(pattern))
                if files:
                    f = files[0]
                    rel_path = f.relative_to(self.legacy_path)
                    key_files.append({
                        'path': str(rel_path),
                        'type': description,
                        'size_kb': f.stat().st_size / 1024
                    })
        
        self.report_data['key_files'] = key_files
        
        if key_files:
            print(f"\n📄 关键文件:")
            for kf in key_files[:10]:
                print(f"  📄 {kf['path']} ({kf['type']}, {kf['size_kb']:.1f}KB)")
    
    def archive_project(self):
        """归档旧项目"""
        print("\n" + "=" * 60)
        print("📦 归档旧项目")
        print("=" * 60)
        
        # 创建归档目录
        archive_name = f"{self.legacy_path.name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        target_dir = self.archive_dir / archive_name
        
        # 如果目录已存在，先删除（可能是上次失败留下的空目录）
        if target_dir.exists():
            print(f"⚠️  检测到已存在的目录: {target_dir}")
            print(f"🗑️  正在清理...")
            shutil.rmtree(target_dir)
        
        print(f"\n📂 归档到: {target_dir}")
        
        # 复制整个项目
        try:
            # 使用shutil.copytree，但忽略node_modules等大目录
            ignore_patterns = shutil.ignore_patterns(
                'node_modules',
                '.git',
                '__pycache__',
                '*.pyc',
                '.DS_Store',
                'dist',
                'build',
                '.next',
                '.nuxt'
            )
            
            shutil.copytree(self.legacy_path, target_dir, ignore=ignore_patterns)
            
            print(f"✅ 项目已归档")
            
            # 计算归档大小
            archived_size = sum(f.stat().st_size for f in target_dir.rglob('*') if f.is_file())
            print(f"📊 归档大小: {archived_size / (1024*1024):.2f} MB")
            
        except Exception as e:
            print(f"❌ 归档失败: {e}")
            return False
        
        return True
    
    def generate_report(self):
        """生成项目现状报告"""
        print("\n" + "=" * 60)
        print("📝 生成项目现状报告")
        print("=" * 60)
        
        report_file = self.archive_dir / f"{self.legacy_path.name}_现状报告.md"
        
        # 生成Markdown报告
        report_content = f"""# {self.report_data['project_name']} - 项目现状报告

> 归档时间: {self.report_data['archive_date']}

---

## 📊 项目统计

| 指标 | 数值 |
|------|------|
| 总文件数 | {self.report_data['statistics'].get('total_files', 0)} |
| 总目录数 | {self.report_data['statistics'].get('total_dirs', 0)} |
| 总大小 | {self.report_data['statistics'].get('total_size_mb', 0):.2f} MB |

## 🔧 技术栈

{chr(10).join([f"- {tech}" for tech in self.report_data.get('tech_stack', [])])}

## 📁 文件类型分布

| 文件类型 | 数量 |
|---------|------|
{chr(10).join([f"| {ext} | {count} |" for ext, count in sorted(self.report_data['statistics'].get('file_types', {}).items(), key=lambda x: x[1], reverse=True)[:10]])}

## 📂 主要目录

| 目录 | 文件数 |
|------|--------|
{chr(10).join([f"| {dir_name}/ | {count} |" for dir_name, count in sorted(self.report_data['statistics'].get('directories', {}).items(), key=lambda x: x[1], reverse=True)[:10]])}

## 🔑 关键文件

{chr(10).join([f"- 📄 `{kf['path']}` ({kf['type']}, {kf['size_kb']:.1f}KB)" for kf in self.report_data.get('key_files', [])[:15]])}

## 📋 下一步建议

### 与PM沟通v2.0需求

现在可以直接与PM角色沟通v2.0需求了！

**建议沟通内容：**

1. **v2.0目标**
   - 需要新增哪些功能？
   - 需要优化哪些现有功能？
   - 需要修复哪些问题？

2. **技术栈决策**
   - 保持现有技术栈还是升级？
   - 是否需要引入新的技术？

3. **架构决策**
   - 是否需要重构现有架构？
   - 是否需要拆分微服务？

4. **优先级**
   - 哪些功能必须在v2.0实现？
   - 哪些可以延后？

**下一步操作：**

```bash
# 1. 在docs/01-需求文档/创建v2.0需求
# 2. PM角色会自动加载归档报告作为上下文
# 3. 按照9阶段工作流开始迭代
```

---

**归档位置:** `docs/09-归档/{self.legacy_path.name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}/`

**原始项目:** `{self.legacy_path}`
"""
        
        # 写入报告
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        print(f"✅ 报告已生成: {report_file}")
        
        # 保存JSON数据
        json_file = self.archive_dir / f"{self.legacy_path.name}_现状数据.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(self.report_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ 数据已保存: {json_file}")
    
    def run(self):
        """执行完整归档流程"""
        try:
            # 1. 分析项目
            self.analyze_legacy_project()
            
            # 2. 检测技术栈
            self.detect_tech_stack()
            
            # 3. 识别关键文件
            self.identify_key_files()
            
            # 4. 确认归档
            print("\n" + "=" * 60)
            response = input("⚠️  确认归档旧项目？(yes/no): ").strip().lower()
            print("=" * 60)
            
            if response != 'yes':
                print("❌ 归档已取消")
                return
            
            # 5. 归档项目
            if not self.archive_project():
                return
            
            # 6. 生成报告
            self.generate_report()
            
            # 7. 完成
            print("\n" + "=" * 60)
            print("🎉 归档完成！现在可以直接与PM沟通v2.0需求！")
            print("=" * 60)
            print(f"\n📂 归档位置: {self.archive_dir}")
            print(f"📄 现状报告: {self.archive_dir / f'{self.legacy_path.name}_现状报告.md'}")
            print(f"\n下一步: 在docs/01-需求文档/创建v2.0需求文档")
            
        except KeyboardInterrupt:
            print("\n\n❌ 归档已取消")
        except Exception as e:
            print(f"\n❌ 归档失败: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("使用方法:")
        print("  python archive_legacy_project.py <旧项目路径>")
        print("\n示例:")
        print("  python archive_legacy_project.py /path/to/old-project")
        sys.exit(1)
    
    legacy_path = sys.argv[1]
    project_root = Path(__file__).parent
    
    if not Path(legacy_path).exists():
        print(f"❌ 旧项目路径不存在: {legacy_path}")
        sys.exit(1)
    
    archiver = LegacyProjectArchiver(project_root, legacy_path)
    archiver.run()
