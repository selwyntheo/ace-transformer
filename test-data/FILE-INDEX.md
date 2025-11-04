# 📚 Complete File Index - Data Mapping Studio

## Welcome! Start Here 👋

This is your complete guide to all files in the Data Mapping Studio project.

---

## 🎯 **Quick Start Guide**

### If you want to...

**Try the application right now** → Open `data-mapping-full.html`

**Understand what file to use** → Read `WHICH-FILE-TO-USE.md`

**Learn how to use the app** → Read `FULL-VERSION-GUIDE.md`

**Test with sample data** → Use files in "Test Files" section below

**Develop with GitLab Copilot** → Start with `REQUIREMENTS.md` then `GITLAB-COPILOT-GUIDE.md`

**Track development tasks** → Use templates in `GITLAB-ISSUE-TEMPLATES.md`

**Quick reference** → Print `QUICK-REFERENCE.md`

---

## 📁 All Files Organized by Purpose

### 🚀 **Ready-to-Use Applications**

#### 1. data-mapping-full.html ⭐ PRIMARY APP
**What**: Complete standalone application with all features
**When to use**: When you want to try the full application immediately
**Features**: File upload, nested fields, 11 computed functions, key-value pairs, export config
**Requirements**: Just a web browser (Chrome, Firefox, Safari, Edge)
**How to use**: Double-click to open

#### 2. demo-standalone.html
**What**: Simplified demo version
**When to use**: Quick preview (use data-mapping-full.html instead)
**Status**: Superseded by full version

#### 3. data-mapping-demo.html
**What**: Original demo attempt
**Status**: Has module loading issues - don't use

---

### 📖 **User Documentation**

#### 4. FULL-VERSION-GUIDE.md ⭐ USER MANUAL
**What**: Complete user manual for the full application
**Size**: 50+ pages
**Contains**:
- Step-by-step tutorials (6 detailed)
- All 11 computed functions explained
- Real-world examples
- Troubleshooting guide
- Pro tips and best practices
**When to read**: After opening the app, before creating your first mapping

#### 5. WHICH-FILE-TO-USE.md ⭐ FILE GUIDE
**What**: Quick guide to decide which file to use
**Size**: 2 pages
**Contains**: Decision tree, file comparison, usage scenarios
**When to read**: If confused about which file to use

#### 6. QUICKSTART.md
**What**: Quick start tutorials
**Size**: 30+ pages
**Contains**: 6 step-by-step walkthroughs, common patterns
**When to read**: After reading FULL-VERSION-GUIDE.md

#### 7. README.md
**What**: Technical documentation
**Size**: 60+ pages
**Contains**: Architecture, features list, installation, API docs
**When to read**: When building React app or need technical details

---

### 💻 **Development Files**

#### 8. REQUIREMENTS.md ⭐ TECHNICAL SPEC
**What**: Complete technical requirements document
**Size**: 220+ pages
**For**: GitLab Copilot and developers
**Contains**:
- Full TypeScript interfaces
- Component specifications
- All computed functions defined
- User stories with acceptance criteria
- Testing requirements (80%+ coverage)
- API design
- Code examples
**When to use**: Before and during development

#### 9. GITLAB-COPILOT-GUIDE.md ⭐ DEVELOPMENT GUIDE
**What**: Step-by-step guide with GitLab Copilot prompts
**Size**: 50+ pages
**Contains**:
- 10 development phases
- 50+ specific Copilot prompts
- Sprint planning (10 sprints)
- Testing patterns
- Command reference
**When to use**: During development with GitLab Copilot

#### 10. GITLAB-ISSUE-TEMPLATES.md ⭐ TASK TRACKING
**What**: Ready-to-use GitLab issue templates
**Size**: 20+ pages
**Contains**:
- 8 issue templates (feature, bug, component, utility, sprint, tech debt, docs, code review)
- Label definitions
- Issue board configuration
- Metrics tracking
**When to use**: When creating GitLab issues

#### 11. QUICK-REFERENCE.md ⭐ CHEAT SHEET
**What**: One-page quick reference
**Size**: 1 page (printable)
**Contains**: Types, commands, colors, structure, sprint schedule
**When to use**: Keep on desk during development

---

### 🧩 **React Components**

#### 12. DataMappingUI.jsx
**What**: Full React component with all features
**Size**: 1000+ lines
**For**: React projects
**Requirements**: 
```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```
**When to use**: Building a React application

#### 13. DataMappingEngine.js
**What**: JavaScript engine to process mappings
**Size**: 500+ lines
**For**: Backend integration, data processing
**When to use**: Need to transform actual data with mapping rules

---

### 🧪 **Test Files**

#### Simple Level (Beginner)

##### 14. test-simple-source.json ⭐ START HERE
**What**: Simple source JSON
**Complexity**: ⭐ (1/5)
**Fields**: 15 fields, 1 nested level, 1 array
**Time**: 20 minutes
**Tests**: Basic mappings, UUID, timestamp, concatenation, aggregations

##### 15. test-simple-target.json
**What**: Simple target structure
**Pairs with**: test-simple-source.json
**Requires**: UUID, timestamp, computed fields

#### Intermediate Level

##### 16. test-source-transactions.csv
**What**: CSV with 20 transaction records
**Complexity**: ⭐⭐⭐ (3/5)
**Columns**: 30 columns
**Time**: 60 minutes
**Tests**: CSV parsing, multiple records, calculations, status translations

#### Advanced Level

##### 17. test-source-complex.json ⭐ COMPREHENSIVE
**What**: Complex nested order data
**Complexity**: ⭐⭐⭐⭐⭐ (5/5)
**Fields**: 150+ fields, 5 nesting levels, 4 arrays
**Time**: 2-3 hours
**Tests**: Everything - deep nesting, arrays, all computed functions, complex expressions

##### 18. test-target-structure.json
**What**: Target structure for complex order
**Pairs with**: test-source-complex.json
**Requires**: All feature types

#### Expert Level

##### 19. test-source-employees.xml
**What**: XML employee records
**Complexity**: ⭐⭐⭐⭐ (4/5)
**Records**: 2 employees
**Fields**: 100+ fields
**Time**: 2 hours
**Tests**: XML parsing, attributes, multiple records

##### 20. test-source-patients.txt
**What**: Structured text patient records
**Complexity**: ⭐⭐⭐⭐ (4/5)
**Records**: 3 patients
**Fields**: 80+ fields
**Time**: 2 hours
**Tests**: Text parsing, hierarchical structure, lists

---

### 📚 **Test Documentation**

#### 21. TEST-FILES-SUMMARY.md ⭐ TEST OVERVIEW
**What**: Complete guide to all test files
**Size**: 20+ pages
**Contains**:
- File comparison table
- Learning path (5 days)
- Complexity ratings
- Time estimates
- Testing checklist
**When to read**: Before testing

#### 22. TEST-FILES-MAPPING-GUIDE.md ⭐ MAPPING EXAMPLES
**What**: Detailed mapping examples for every test file
**Size**: 50+ pages
**Contains**:
- 100+ example mappings
- Every computed function demonstrated
- Key-value pair patterns
- Step-by-step instructions
**When to use**: While creating mappings

---

### 🗃️ **Sample Data (Original)**

##### 23. sample-source.json
**What**: Original sample user data
**Contains**: User with nested address, employment, orders
**Status**: Use test-simple-source.json or test-source-complex.json instead

##### 24. sample-target.json
**What**: Original sample customer structure
**Status**: Use test-target-structure.json instead

##### 25. sample-source.csv
**What**: Original 5-record CSV
**Status**: Use test-source-transactions.csv (has 20 records)

##### 26. sample-mapping-config.json
**What**: Example mapping configuration
**Contains**: 12 sample mappings with input/output examples

---

### ⚙️ **Configuration**

#### 27. package.json
**What**: NPM dependencies
**For**: React project setup
**Contains**: All required packages and scripts

---

## 📊 **File Categories Summary**

| Category | Count | Files |
|----------|-------|-------|
| **Applications** | 3 | data-mapping-full.html (use this), demo-standalone.html, data-mapping-demo.html |
| **User Docs** | 5 | FULL-VERSION-GUIDE.md, WHICH-FILE-TO-USE.md, QUICKSTART.md, README.md, sample-mapping-config.json |
| **Developer Docs** | 4 | REQUIREMENTS.md, GITLAB-COPILOT-GUIDE.md, GITLAB-ISSUE-TEMPLATES.md, QUICK-REFERENCE.md |
| **Components** | 2 | DataMappingUI.jsx, DataMappingEngine.js |
| **Test Files** | 7 | 2 simple, 1 CSV, 2 complex JSON, 1 XML, 1 TXT |
| **Test Docs** | 2 | TEST-FILES-SUMMARY.md, TEST-FILES-MAPPING-GUIDE.md |
| **Config** | 1 | package.json |
| **Total** | **27** | **Complete Package** |

---

## 🎯 **Usage Scenarios**

### Scenario 1: "I want to try it now"
1. Open `data-mapping-full.html`
2. Upload `test-simple-source.json`
3. Upload `test-simple-target.json`
4. Create 5-10 mappings
5. Export configuration

**Time**: 20 minutes

---

### Scenario 2: "I want to learn everything"
1. Open `data-mapping-full.html`
2. Read `FULL-VERSION-GUIDE.md`
3. Read `TEST-FILES-SUMMARY.md`
4. Work through test files in order:
   - Day 1: Simple JSON
   - Day 2: Transactions CSV
   - Day 3-4: Complex JSON
   - Day 5: XML and TXT
5. Use `TEST-FILES-MAPPING-GUIDE.md` as reference

**Time**: 1 week

---

### Scenario 3: "I need to build this in React"
1. Read `README.md` (architecture)
2. Read `REQUIREMENTS.md` (complete spec)
3. Read `GITLAB-COPILOT-GUIDE.md` (development steps)
4. Use `GITLAB-ISSUE-TEMPLATES.md` (tracking)
5. Copy `DataMappingUI.jsx` and `DataMappingEngine.js`
6. Follow Phase 1-10 in Copilot guide
7. Use `QUICK-REFERENCE.md` during development

**Time**: 10 weeks (10 sprints)

---

### Scenario 4: "I need to create production mappings"
1. Open `data-mapping-full.html`
2. Upload your source file
3. Upload your target file
4. Reference `TEST-FILES-MAPPING-GUIDE.md` for examples
5. Create all mappings
6. Export configuration
7. Use with `DataMappingEngine.js` in production

**Time**: 2-4 hours per mapping configuration

---

## 📈 **Recommended Reading Order**

### For End Users:
1. `WHICH-FILE-TO-USE.md` (2 min)
2. `FULL-VERSION-GUIDE.md` (30 min)
3. `TEST-FILES-SUMMARY.md` (10 min)
4. `TEST-FILES-MAPPING-GUIDE.md` (reference)

### For Developers:
1. `README.md` (1 hour)
2. `REQUIREMENTS.md` (4 hours)
3. `GITLAB-COPILOT-GUIDE.md` (2 hours)
4. `QUICK-REFERENCE.md` (keep handy)
5. `GITLAB-ISSUE-TEMPLATES.md` (as needed)

---

## 🎓 **Skill Levels**

### Beginner (Never used before)
**Start with**:
- data-mapping-full.html
- test-simple-source.json
- FULL-VERSION-GUIDE.md (sections 1-5)

**Time**: 1 hour

---

### Intermediate (Basic mapping experience)
**Start with**:
- data-mapping-full.html
- test-source-transactions.csv
- TEST-FILES-MAPPING-GUIDE.md

**Time**: 2 hours

---

### Advanced (Complex mapping needs)
**Start with**:
- data-mapping-full.html
- test-source-complex.json
- TEST-FILES-MAPPING-GUIDE.md (all examples)

**Time**: 4 hours

---

### Expert (Building the application)
**Start with**:
- REQUIREMENTS.md
- GITLAB-COPILOT-GUIDE.md
- DataMappingUI.jsx
- DataMappingEngine.js

**Time**: 10 weeks

---

## 🔍 **Find Files by Need**

### Need to Generate UUID?
- See: FULL-VERSION-GUIDE.md (Section on UUID)
- Example: TEST-FILES-MAPPING-GUIDE.md (UUID examples)
- Test with: Any test file

### Need Nested Field Mapping?
- See: FULL-VERSION-GUIDE.md (Nested section)
- Example: TEST-FILES-MAPPING-GUIDE.md (Complex JSON section)
- Test with: test-source-complex.json

### Need Many-to-1 Mapping?
- See: FULL-VERSION-GUIDE.md (Many-to-1 section)
- Example: TEST-FILES-MAPPING-GUIDE.md (Concatenation examples)
- Test with: test-simple-source.json (fullName)

### Need Key-Value Pairs?
- See: FULL-VERSION-GUIDE.md (Key-Value section)
- Example: TEST-FILES-MAPPING-GUIDE.md (Status translations)
- Test with: test-source-transactions.csv (multiple status fields)

### Need Array Aggregation?
- See: FULL-VERSION-GUIDE.md (COUNT, SUM, AVERAGE)
- Example: TEST-FILES-MAPPING-GUIDE.md (Analytics section)
- Test with: test-simple-source.json (scores array)

### Need Custom Expressions?
- See: FULL-VERSION-GUIDE.md (Custom function)
- Example: TEST-FILES-MAPPING-GUIDE.md (Calculations)
- Test with: test-source-complex.json (complex calculations)

---

## ✅ **Verification Checklist**

Check you have all 27 files:

**Applications** (3):
- [ ] data-mapping-full.html
- [ ] demo-standalone.html
- [ ] data-mapping-demo.html

**Docs** (11):
- [ ] FULL-VERSION-GUIDE.md
- [ ] WHICH-FILE-TO-USE.md
- [ ] QUICKSTART.md
- [ ] README.md
- [ ] REQUIREMENTS.md
- [ ] GITLAB-COPILOT-GUIDE.md
- [ ] GITLAB-ISSUE-TEMPLATES.md
- [ ] QUICK-REFERENCE.md
- [ ] TEST-FILES-SUMMARY.md
- [ ] TEST-FILES-MAPPING-GUIDE.md
- [ ] THIS FILE (FILE-INDEX.md)

**Components** (2):
- [ ] DataMappingUI.jsx
- [ ] DataMappingEngine.js

**Test Files** (7):
- [ ] test-simple-source.json
- [ ] test-simple-target.json
- [ ] test-source-transactions.csv
- [ ] test-source-complex.json
- [ ] test-target-structure.json
- [ ] test-source-employees.xml
- [ ] test-source-patients.txt

**Original Samples** (4):
- [ ] sample-source.json
- [ ] sample-target.json
- [ ] sample-source.csv
- [ ] sample-mapping-config.json

**Config** (1):
- [ ] package.json

---

## 🎉 **You're All Set!**

You now have everything you need to:
- ✅ Try the application
- ✅ Learn all features
- ✅ Test with comprehensive data
- ✅ Develop with GitLab Copilot
- ✅ Build production mappings
- ✅ Deploy to production

**Next Step**: Open `data-mapping-full.html` and start mapping! 🚀

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-11-03  
**Total Files**: 27  
**Total Pages**: 500+

**Need help?** Start with `WHICH-FILE-TO-USE.md`!