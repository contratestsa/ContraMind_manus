# AI Audit & Safety Evaluation Documentation

This directory contains comprehensive documentation and tooling for AI-driven repository audits and safety evaluations.

## Overview

The ContraMind.ai project includes a complete AI audit framework designed to enable autonomous AI agents to perform deep, systematic code audits and generate actionable remediation plans. This framework is particularly valuable for:

- **AI-powered contract analysis platforms** requiring high reliability and safety
- **Production SaaS applications** with complex AI/LLM pipelines
- **Multi-language applications** (Arabic/English) with RTL/LTR support
- **Enterprise-grade systems** requiring comprehensive governance

## Documentation Structure

### Core Documentation

#### [`AI_AUDIT_PROMPT_PACK.md`](./AI_AUDIT_PROMPT_PACK.md)
**Purpose:** Complete guide for AI auditors performing repository analysis.

**Contents:**
- Multi-phase audit methodology (Discovery → Analysis → Synthesis → Remediation)
- Specialized audit domains (Architecture, Code Quality, AI/LLM, Security, DevOps, Documentation)
- Output specifications and quality criteria
- Example workflows and best practices

**Use this when:** Initiating a comprehensive repository audit or training AI agents on audit procedures.

#### [`../AI_SAFETY_EVAL.md`](../AI_SAFETY_EVAL.md)
**Purpose:** AI safety evaluation framework for LLM-powered applications.

**Contents:**
- Safety evaluation criteria for AI systems
- Risk assessment methodologies
- Compliance checklists (GDPR, data protection, ethical AI)
- Prompt injection and adversarial testing guidelines
- Monitoring and incident response procedures

**Use this when:** Evaluating AI safety, conducting security reviews, or establishing AI governance policies.

## Templates

Located in [`../../templates/`](../../templates/):

### [`Audit-Report.md`](../../templates/Audit-Report.md)
Structured template for comprehensive audit reports including:
- Executive summary
- Prioritized findings table with severity/confidence ratings
- Root cause analysis with evidence
- Ordered fix plan
- Code diffs (unified patches)
- Test requirements
- Documentation updates
- Risk assessment and rollback procedures

### [`Fix-Plan.md`](../../templates/Fix-Plan.md)
Actionable remediation plan template with:
- Prioritized fix sequence
- Dependency mapping
- Time estimates
- Risk mitigation strategies
- Validation criteria

### [`Test-Plan.md`](../../templates/Test-Plan.md)
Comprehensive test coverage plan including:
- Unit test requirements
- Integration test scenarios
- E2E critical path testing
- Performance benchmarks
- Security testing procedures

## Schemas

Located in [`../../schemas/`](../../schemas/):

### [`issues.schema.json`](../../schemas/issues.schema.json)
Machine-readable JSON schema for audit findings, enabling:
- Automated issue tracking
- CI/CD integration
- Metrics and analytics
- Issue prioritization algorithms

**Schema Structure:**
```json
{
  "issues": [
    {
      "id": "string",
      "severity": "critical|high|medium|low",
      "confidence": "high|medium|low",
      "category": "string",
      "component": "string",
      "file": "string",
      "lines": "string",
      "summary": "string",
      "description": "string",
      "impact": "string",
      "recommendation": "string",
      "references": ["string"]
    }
  ]
}
```

## Scripts

Located in [`../../scripts/`](../../scripts/):

### [`generate_repo_tree.sh`](../../scripts/generate_repo_tree.sh)
Generates comprehensive repository structure for audit context.

**Usage:**
```bash
cd /path/to/repository
./scripts/generate_repo_tree.sh > repo-structure.txt
```

**Output:** Hierarchical tree view with file counts, sizes, and key metadata.

## GitHub Integration

### Issue Templates

#### [`.github/ISSUE_TEMPLATE/audit_request.md`](../../.github/ISSUE_TEMPLATE/audit_request.md)
Standardized template for requesting AI-driven audits via GitHub Issues.

**Includes:**
- Context gathering (runtime, infrastructure, recent changes)
- Reproduction steps
- Audit scope selection
- AI auditor instructions

**Usage:** Create new issue → Select "Audit Request" template → Fill in details

### Workflows

#### [`.github/workflows/security.yml`](../../.github/workflows/security.yml)
Automated security scanning workflow running on:
- Push to main/master branches
- Pull requests
- Weekly schedule (Mondays 9 AM UTC)

**Scans Include:**
- **Secrets Detection:** Gitleaks for exposed credentials
- **Dependency Audit:** npm/pnpm vulnerability scanning
- **License Compliance:** License checker for legal compliance

**Configuration:** Soft-fail mode during initial implementation to avoid blocking CI.

## Audit Workflow

### 1. Request Audit
Create GitHub issue using audit request template or directly invoke AI auditor with context.

### 2. AI Auditor Execution
AI agent follows `AI_AUDIT_PROMPT_PACK.md` methodology:
1. **Discovery Phase:** Repository structure analysis, dependency mapping
2. **Analysis Phase:** Domain-specific deep dives (architecture, security, AI/LLM, etc.)
3. **Synthesis Phase:** Cross-cutting issue identification, prioritization
4. **Remediation Phase:** Fix plan generation, test plan creation

### 3. Output Generation
AI generates:
- `Audit-Report.md` (human-readable comprehensive report)
- `Fix-Plan.md` (prioritized remediation steps)
- `Test-Plan.md` (test coverage requirements)
- `issues.json` (machine-readable findings conforming to schema)

### 4. Review & Implementation
Development team:
1. Reviews audit findings and fix plan
2. Prioritizes based on severity and business impact
3. Implements fixes following the ordered plan
4. Adds tests per test plan requirements
5. Updates documentation as specified

### 5. Validation
- Run automated security workflow
- Execute new tests
- Verify fixes resolve root causes
- Update audit status in issue tracker

## Best Practices

### For AI Auditors
1. **Follow the methodology:** Complete all phases systematically
2. **Provide evidence:** Include file paths, line numbers, code snippets
3. **Prioritize ruthlessly:** Use severity + confidence matrix
4. **Think in systems:** Identify cross-cutting concerns and architectural issues
5. **Be actionable:** Every finding must have a clear remediation path

### For Development Teams
1. **Request audits proactively:** Before major releases, after significant refactors
2. **Treat findings seriously:** Even low-severity issues can compound
3. **Follow fix order:** Dependencies matter—respect the sequence
4. **Add tests first:** TDD approach to validation
5. **Document decisions:** Update ADRs for architectural changes

### For Project Governance
1. **Schedule regular audits:** Quarterly comprehensive reviews
2. **Track metrics:** Issue resolution time, recurrence rates
3. **Integrate with CI/CD:** Automated security scans on every PR
4. **Maintain audit trail:** Keep all reports and fix plans in version control
5. **Review AI safety:** Regular evaluations using AI_SAFETY_EVAL.md framework

## Integration with Project Documentation

This audit framework complements existing project governance:

- **[`MANUS_OPERATING_GUIDE.md`](../MANUS_OPERATING_GUIDE.md):** 15 essential prompts for AI agents
- **[`STACK_LOCK.md`](../STACK_LOCK.md):** Technology stack decisions
- **[`QUALITY_GATES.md`](../QUALITY_GATES.md):** CI stages and quality criteria
- **[`OBSERVABILITY.md`](../OBSERVABILITY.md):** Monitoring and tracing setup
- **[`CONTRIBUTING.md`](../CONTRIBUTING.md):** Development workflow
- **[`INCIDENT_RESPONSE.md`](../INCIDENT_RESPONSE.md):** Production incident procedures

## Example Use Cases

### Use Case 1: Pre-Release Security Audit
**Scenario:** Major release with new AI features and payment integration.

**Steps:**
1. Create audit request issue with scope: Security, AI/LLM, Payment flows
2. AI auditor analyzes codebase focusing on:
   - Prompt injection vulnerabilities
   - Payment webhook security
   - API authentication
   - Data encryption
3. Generates findings with severity ratings
4. Development team addresses critical/high issues before release
5. Medium/low issues scheduled for next sprint

### Use Case 2: Performance Optimization Audit
**Scenario:** RUM metrics show degrading Web Vitals (LCP > 3s).

**Steps:**
1. Request audit with scope: Performance, Frontend Architecture
2. AI auditor identifies:
   - Bundle size issues
   - Unoptimized images
   - Missing code splitting
   - Inefficient re-renders
3. Fix plan prioritizes by impact on Core Web Vitals
4. Test plan includes performance benchmarks
5. Implementation validated against QUALITY_GATES.md targets

### Use Case 3: Compliance Audit for Saudi Market
**Scenario:** Ensuring Sharia compliance and KSA regulatory requirements.

**Steps:**
1. Request audit with scope: AI/LLM (Sharia compliance), Security (data residency)
2. AI auditor reviews:
   - AI prompts for Islamic finance principles
   - Data storage locations
   - Privacy compliance (GDPR-equivalent)
   - Arabic language support quality
3. Generates compliance report with regulatory references
4. Legal team reviews findings
5. Development implements required changes

## Continuous Improvement

This framework is designed to evolve:

- **Template refinement:** Update based on audit outcomes
- **Schema extensions:** Add fields as new categories emerge
- **Workflow automation:** Integrate with project management tools
- **AI model updates:** Leverage improved LLM capabilities
- **Community contributions:** Accept PRs for methodology improvements

## Support & Feedback

For questions, issues, or suggestions:
1. Create GitHub issue with appropriate label
2. Reference relevant documentation section
3. Provide specific examples or use cases
4. Suggest improvements via pull request

---

**Last Updated:** October 27, 2025  
**Maintained By:** ContraMind.ai Development Team  
**License:** Proprietary (Internal Use)

