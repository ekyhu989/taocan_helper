# 智能采购助手 - 自动化测试套件

## 目录结构

```
01_自动化测试/
├── __init__.py
├── README.md                          # 本文件
├── pytest.ini                         # pytest配置文件
├── requirements.txt                   # Python依赖
├── ECC_VERIFICATION.md                # ECC校验报告
├── business_logic_validator.py        # 业务逻辑校验模块（核心）
├── test_procurment_assistant.py       # pytest主测试用例（TC01-TC16）
├── test_data_generator.py             # 测试数据生成器
└── data_cleaner.py                    # 数据清洗器
```

## 快速开始

### 1. 安装依赖

```bash
cd tests
pip install -r requirements.txt
```

### 2. 运行完整测试

```bash
pytest test_procurment_assistant.py
```

### 3. 运行指定测试用例

```bash
# 按页面运行
pytest -m page1
pytest -m page2

# 按测试类型运行
pytest -m functional
pytest -m compliance

# 按具体TC编号运行
pytest -m TC01
pytest -m TC03
```

### 4. 生成测试报告

```bash
pytest --html=test_report.html --self-contained-html
```

## 模块说明

### 1. business_logic_validator.py
业务逻辑校验核心模块

**功能：**
- 832平台占比计算与校验
- 人均预算校验（含新疆政策阈值2000元）
- 总价误差≤±5%校验
- 合规阈值判断

**使用示例：**
```python
from business_logic_validator import BusinessLogicValidator

validator = BusinessLogicValidator('../../src/data/products.json')

# 预算校验
result = validator.validate_budget(total_budget=25000, head_count=10)
print(result.per_capita)  # 2500.0
print(result.is_over_xinjiang_threshold)  # True

# 832占比计算
items = validator.generate_test_items([0, 1, 2, 3], [10, 10, 10, 10])
amount, rate = validator.calculate_platform832_compliance(items)
```

### 2. test_procurment_assistant.py
主测试用例文件，覆盖TC01-TC16

**测试覆盖：**
- Page1：基础信息录入（TC01-TC03）
- Page2：采购方案生成（TC04-TC06）
- Page3：公文生成与交付（TC07-TC09）
- Page4：合规测算（TC10）
- 兼容性测试（TC11-TC13）
- 性能测试（TC14-TC16）

### 3. test_data_generator.py
测试数据生成器

**功能：**
- 生成各种场景的用户输入数据
- 生成正常场景、新疆政策场景、832占比场景
- 生成采购品单项测试数据
- 生成性能测试大数据量数据

**使用示例：**
```python
from test_data_generator import TestDataGenerator

generator = TestDataGenerator('../../src/data/products.json')

# 生成正常场景
normal_data = generator.generate_normal_scenario()

# 生成新疆政策场景（人均>2000元）
xinjiang_data = generator.generate_xinjiang_policy_scenario()

# 生成所有测试场景
all_scenarios = generator.generate_all_test_scenarios()
generator.save_to_json(all_scenarios, 'test_scenarios.json')
```

### 4. data_cleaner.py
数据清洗器

**功能：**
- 清洗用户输入数据
- 清洗采购品单数据
- 校验合规测算数据
- 数据类型转换、格式校验、逻辑一致性检查

**使用示例：**
```python
from data_cleaner import DataCleaner

cleaner = DataCleaner()

# 清洗用户输入
cleaned, errors, warnings = cleaner.clean_user_input(raw_data)

# 清洗品单
cleaned_items, errors, warnings = cleaner.clean_purchase_items(raw_items)
```

## 核心业务逻辑

### 832平台占比计算

**计算公式：**
```
832商品总金额 = sum(item.subtotal for item in items if item.product.is832)
总金额 = sum(item.subtotal for item in items)
832占比 = 832商品总金额 / 总金额
```

**合规阈值：** ≥30%

### 人均预算校验

**普通预警：** >500元（黄色提醒）

**新疆政策阈值：** >2000元（橙色警告，建议832占比≥30%）

### 总价误差校验

**允许范围：** ≤±5%

**计算公式：**
```
绝对误差 = |实际金额 - 预期预算|
误差率 = 绝对误差 / 预期预算
```

## 测试数据

测试数据文件位置：`../../src/data/products.json`

## 注意事项

1. **Python版本**：Python 3.8+
2. **依赖安装**：首次使用前请安装requirements.txt中的依赖
3. **商品库路径**：确保 `../../src/data/products.json` 存在
4. **风险提示**：
   - 本测试套件主要覆盖业务逻辑层
   - UI层测试需要配合UI自动化工具（如Selenium、Appium）
   - 性能测试结果仅供参考，实际性能需在生产环境验证

## 扩展开发

如需添加新的测试用例：

1. 在`test_procurment_assistant.py`中添加测试函数
2. 使用适当的marker标记（@pytest.mark.TCxx）
3. 确保测试覆盖正常、边界、异常场景

## 作者

智能采购助手测试团队
