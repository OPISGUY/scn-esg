# SCN ESG Platform - Production Roadmap

**Date**: October 4, 2025  
**Status**: Post-Alpha Planning  
**Goal**: Transform alpha platform into production-ready enterprise solution

---

## Overview

This roadmap outlines the path from alpha testing to production launch, focusing on essential features for enterprise deployment including self-hosted email infrastructure, user management, and multi-tenancy.

---

## Phase 1: Self-Hosted Email Infrastructure ⏳

**Goal**: Eliminate dependency on external paid email services (SendGrid/AWS SES) by hosting our own SMTP relay

### 1.1 Email Architecture Decision

#### Option A: Postfix SMTP Relay (Production Recommended) ✅
**Best for**: Production deployments with full control

**Pros**:
- ✅ Industry-standard, battle-tested MTA (Mail Transfer Agent)
- ✅ Full control over delivery and reputation
- ✅ No per-email costs
- ✅ Excellent deliverability with proper configuration
- ✅ SPF, DKIM, DMARC support
- ✅ Can relay through upstream SMTP for better delivery

**Cons**:
- ⚠️ Requires server with static IP
- ⚠️ DNS configuration (SPF, DKIM, DMARC records)
- ⚠️ IP reputation management
- ⚠️ Server maintenance overhead

**Setup Complexity**: Medium  
**Cost**: $5-10/month VPS + domain  
**Time to Implement**: 2-3 hours

#### Option B: MailHog (Development Only) ✅
**Best for**: Local development and testing

**Pros**:
- ✅ Zero configuration SMTP server
- ✅ Web UI to view sent emails
- ✅ No external dependencies
- ✅ Perfect for testing flows

**Cons**:
- ❌ Development only, not for production
- ❌ No actual email delivery
- ❌ No authentication

**Setup Complexity**: Trivial  
**Cost**: Free  
**Time to Implement**: 15 minutes

#### Option C: Self-Hosted Mailu/Mail-in-a-Box (Full Mail Server)
**Best for**: Organizations needing complete email infrastructure

**Pros**:
- ✅ Complete mail server (SMTP + IMAP)
- ✅ Web admin interface
- ✅ User mailboxes
- ✅ Spam filtering, antivirus

**Cons**:
- ⚠️ High complexity
- ⚠️ Requires dedicated server
- ⚠️ Significant maintenance overhead
- ⚠️ Overkill for transactional emails only

**Setup Complexity**: High  
**Cost**: $20+/month dedicated server  
**Time to Implement**: 4-8 hours

#### Recommended Approach: Hybrid Strategy ✅

**Development**: MailHog  
**Staging**: Postfix relay with test domain  
**Production**: Postfix relay OR managed SMTP relay (e.g., via your hosting provider)

### 1.2 Implementation Tasks

#### Task 1.2.1: MailHog Development Setup
- [ ] Install MailHog locally via Docker
- [ ] Configure Django to use MailHog in development
- [ ] Update settings_sqlite.py with MailHog configuration
- [ ] Test email verification and password reset flows

#### Task 1.2.2: Postfix Production Setup (Optional)
- [ ] Provision VPS with static IP (DigitalOcean, Linode, Vultr)
- [ ] Install and configure Postfix
- [ ] Set up SPF, DKIM, DMARC DNS records
- [ ] Configure TLS certificates
- [ ] Test deliverability to major providers (Gmail, Outlook)
- [ ] Set up monitoring and logs

#### Task 1.2.3: Django Email Configuration
- [ ] Create environment-aware email backend configuration
- [ ] Add EMAIL_BACKEND switcher based on environment
- [ ] Configure retry logic and error handling
- [ ] Add email logging for debugging
- [ ] Implement fallback SMTP relay option

**Deliverables**:
- ✅ MailHog running in Docker for dev
- ✅ Django configured with environment-based email backends
- ✅ Email verification and password reset working locally
- 📋 Production Postfix setup guide (if needed)

**Timeline**: 1-2 days  
**Priority**: HIGH (blocks user verification)

---

## Phase 2: Email Verification Enforcement 🔒

**Goal**: Require users to verify email before accessing platform features

### 2.1 Backend Implementation

#### Task 2.1.1: Email Verification Flow
- [ ] Add `is_email_verified` field to User model (already exists)
- [ ] Generate email verification tokens (JWT or UUID)
- [ ] Create verification email template (HTML + text)
- [ ] Implement `/api/v1/users/auth/verify-email/` endpoint
- [ ] Add `/api/v1/users/auth/resend-verification/` endpoint
- [ ] Store verification token expiry (24 hours default)

#### Task 2.1.2: Verification Middleware
- [ ] Create `EmailVerificationMiddleware`
- [ ] Block unverified users from accessing protected routes
- [ ] Whitelist login, registration, verification endpoints
- [ ] Return 403 with clear error for unverified users

#### Task 2.1.3: Password Reset with Email
- [ ] Generate password reset tokens
- [ ] Create password reset email template
- [ ] Implement `/api/v1/users/auth/request-password-reset/` endpoint
- [ ] Implement `/api/v1/users/auth/confirm-password-reset/<token>/` endpoint
- [ ] Add rate limiting (max 3 requests per hour per email)

### 2.2 Frontend Implementation

#### Task 2.2.1: Email Verification UI
- [ ] Create `EmailVerificationPage.tsx` component
- [ ] Add "Resend Verification Email" button
- [ ] Show verification status in user profile
- [ ] Handle verification success/error states
- [ ] Add countdown timer for resend (60 seconds)

#### Task 2.2.2: Verification Flow Integration
- [ ] Redirect unverified users after registration
- [ ] Parse verification token from email link
- [ ] Call verification API on page load
- [ ] Show success message and auto-redirect to dashboard
- [ ] Handle expired/invalid token errors

#### Task 2.2.3: Password Reset UI
- [ ] Update `ForgotPasswordPage.tsx` with email sending
- [ ] Create `PasswordResetConfirmPage.tsx` for token handling
- [ ] Add password strength validator
- [ ] Show success message after reset
- [ ] Auto-redirect to login

**Deliverables**:
- ✅ Email verification required for platform access
- ✅ Resend verification email functionality
- ✅ Password reset via email working
- ✅ Clear error messages and user guidance

**Timeline**: 2-3 days  
**Priority**: HIGH (security requirement)

---

## Phase 3: User Profile Management 👤

**Goal**: Allow users to edit their profile information, change passwords, and manage settings

### 3.1 Backend Implementation

#### Task 3.1.1: Profile Update Endpoints
- [ ] Create `/api/v1/users/profile/` GET endpoint
- [ ] Create `/api/v1/users/profile/` PATCH endpoint
- [ ] Editable fields: first_name, last_name, email, phone, bio
- [ ] Validate email uniqueness on change
- [ ] Require email verification if email changes

#### Task 3.1.2: Password Change Endpoint
- [ ] Create `/api/v1/users/password/change/` endpoint
- [ ] Require current password for verification
- [ ] Validate new password strength
- [ ] Log password change events
- [ ] Send confirmation email after change

#### Task 3.1.3: Avatar/Profile Picture
- [ ] Add `avatar` ImageField to User model
- [ ] Create `/api/v1/users/avatar/upload/` endpoint
- [ ] Implement image validation (size, format)
- [ ] Generate thumbnails (optional)
- [ ] Serve avatars via CDN or media URL

#### Task 3.1.4: User Preferences
- [ ] Add `preferences` JSONField to User model
- [ ] Store UI preferences (theme, language, notifications)
- [ ] Create `/api/v1/users/preferences/` endpoint
- [ ] Support preference categories

### 3.2 Frontend Implementation

#### Task 3.2.1: Profile Settings Page
- [ ] Create `ProfileSettings.tsx` component
- [ ] Form sections: Personal Info, Security, Preferences
- [ ] Implement form validation
- [ ] Add "Save Changes" with loading state
- [ ] Show success/error notifications

#### Task 3.2.2: Password Change Modal
- [ ] Create `ChangePasswordModal.tsx`
- [ ] Fields: current password, new password, confirm
- [ ] Real-time password strength indicator
- [ ] Submit and handle errors

#### Task 3.2.3: Avatar Upload
- [ ] Create `AvatarUpload.tsx` component
- [ ] Drag-and-drop or file picker
- [ ] Image preview before upload
- [ ] Crop/resize tool (optional)
- [ ] Display current avatar with upload button

**Deliverables**:
- ✅ User profile editing functional
- ✅ Password change with current password verification
- ✅ Avatar upload and display
- ✅ User preferences persistence

**Timeline**: 2-3 days  
**Priority**: MEDIUM (nice-to-have for beta)

---

## Phase 4: Team Collaboration Features 👥

**Goal**: Enable companies to invite team members and manage user roles

### 4.1 Backend Implementation

#### Task 4.1.1: User Invitations System
- [ ] Create `Invitation` model (email, role, company, token, expires_at)
- [ ] Create `/api/v1/companies/<id>/invitations/` endpoint
- [ ] Generate unique invitation tokens
- [ ] Send invitation emails with signup link
- [ ] Set 7-day expiration on invitations
- [ ] Track invitation status (pending, accepted, expired)

#### Task 4.1.2: Team Member Management
- [ ] Create `/api/v1/companies/<id>/members/` endpoint (list team)
- [ ] Add `/api/v1/companies/<id>/members/<user_id>/` (update role)
- [ ] Remove member endpoint (DELETE)
- [ ] Permission check: only admins can manage team
- [ ] Log all team changes for audit

#### Task 4.1.3: Invitation Acceptance Flow
- [ ] Create `/api/v1/invitations/<token>/accept/` endpoint
- [ ] Validate token and expiration
- [ ] Create user account if email doesn't exist
- [ ] Associate user with company and set role
- [ ] Mark invitation as accepted

### 4.2 Frontend Implementation

#### Task 4.2.1: Team Management Page
- [ ] Create `TeamManagement.tsx` component
- [ ] Display current team members with roles
- [ ] Add "Invite Member" button
- [ ] Show pending invitations
- [ ] Role change dropdown (admin only)
- [ ] Remove member with confirmation modal

#### Task 4.2.2: Invitation Modal
- [ ] Create `InviteUserModal.tsx`
- [ ] Email input with validation
- [ ] Role selector
- [ ] Optional personal message
- [ ] Submit and show success notification

#### Task 4.2.3: Invitation Acceptance Page
- [ ] Create `AcceptInvitation.tsx` page
- [ ] Parse token from URL
- [ ] Show company name and inviter
- [ ] If user exists: confirm join, set role
- [ ] If new user: show registration form with pre-filled email
- [ ] Auto-redirect to dashboard after acceptance

**Deliverables**:
- ✅ Team member invitation via email
- ✅ Team management interface for admins
- ✅ Invitation acceptance flow for new/existing users
- ✅ Role assignment on invitation

**Timeline**: 3-4 days  
**Priority**: MEDIUM (collaboration feature)

---

## Phase 5: Advanced Permissions System 🔐

**Goal**: Implement granular resource-level permissions with role-based access control

### 5.1 Backend Implementation

#### Task 5.1.1: Permission Model Design
- [ ] Create `Permission` model (resource_type, action, role)
- [ ] Define resource types: footprint, report, offset, company, user
- [ ] Define actions: view, create, edit, delete, export
- [ ] Seed default permissions for roles

#### Task 5.1.2: Role Definitions
- [ ] Admin: Full access to all resources
- [ ] Sustainability Manager: Full data entry, view reports
- [ ] Decision Maker: View all, no edit
- [ ] Viewer: View own company data only

#### Task 5.1.3: Permission Checking Utilities
- [ ] Create `has_permission(user, resource, action)` helper
- [ ] Create `@require_permission(resource, action)` decorator
- [ ] Integrate with DRF viewsets
- [ ] Add permission checks to serializers

#### Task 5.1.4: Row-Level Permissions
- [ ] Company-level data isolation (users only see their company)
- [ ] Ownership checks (user can edit their own footprints)
- [ ] Admin override (admins can access all company data)

### 5.2 Frontend Implementation

#### Task 5.2.1: Permission Context
- [ ] Create `PermissionsContext.tsx`
- [ ] Fetch user permissions on login
- [ ] Provide `can(resource, action)` helper
- [ ] Cache permissions in localStorage

#### Task 5.2.2: UI Permission Guards
- [ ] Hide/disable buttons based on permissions
- [ ] Show read-only views for viewers
- [ ] Disable edit forms for unauthorized users
- [ ] Add permission-based route guards

#### Task 5.2.3: Role Management UI
- [ ] Create `RoleManagement.tsx` page (admin only)
- [ ] Display role matrix (role × resource × action)
- [ ] Edit permissions per role
- [ ] Save and apply changes

**Deliverables**:
- ✅ Granular permission system implemented
- ✅ Role-based access control enforced
- ✅ UI adapts based on user permissions
- ✅ Admin interface for permission management

**Timeline**: 4-5 days  
**Priority**: MEDIUM (enterprise requirement)

---

## Phase 6: Multi-Company Support 🏢

**Goal**: Allow users to belong to multiple companies and switch between contexts

### 6.1 Backend Implementation

#### Task 6.1.1: Many-to-Many Relationship
- [ ] Create `CompanyMembership` model (user, company, role, is_primary)
- [ ] Migrate from one-to-one to many-to-many
- [ ] Update User model to remove direct company FK
- [ ] Add `user.companies.all()` and `user.primary_company` properties

#### Task 6.1.2: Active Company Context
- [ ] Add `active_company_id` to user session
- [ ] Create `/api/v1/users/switch-company/<company_id>/` endpoint
- [ ] Store active company in JWT claims (optional)
- [ ] Filter all queries by active company

#### Task 6.1.3: Data Isolation
- [ ] Update all model managers to filter by active company
- [ ] Add `company` field to all major models (if missing)
- [ ] Ensure footprints, reports, offsets are company-scoped
- [ ] Prevent cross-company data leaks

#### Task 6.1.4: Company Creation
- [ ] Create `/api/v1/companies/create/` endpoint
- [ ] User becomes admin of new company
- [ ] Set as primary company by default
- [ ] Send welcome email with company details

### 6.2 Frontend Implementation

#### Task 6.2.1: Company Switcher UI
- [ ] Add company dropdown to navigation bar
- [ ] Show current active company
- [ ] List all user's companies
- [ ] Switch company on selection
- [ ] Refresh dashboard data after switch

#### Task 6.2.2: Multi-Company Dashboard
- [ ] Update dashboard to show active company name
- [ ] Filter all data by active company
- [ ] Show company logo/avatar (optional)
- [ ] Add "Create New Company" option in dropdown

#### Task 6.2.3: Company Management
- [ ] Create `CompanyManagement.tsx` page
- [ ] Show user's companies with roles
- [ ] Set primary company
- [ ] Leave company (if not last admin)
- [ ] Create new company form

**Deliverables**:
- ✅ Users can belong to multiple companies
- ✅ Company switcher in navigation
- ✅ Data properly scoped to active company
- ✅ Company creation and management UI

**Timeline**: 4-5 days  
**Priority**: LOW (advanced feature)

---

## Phase 7: Testing & Quality Assurance ✅

**Goal**: Ensure all new features are robust, secure, and production-ready

### 7.1 Backend Testing

#### Task 7.1.1: Unit Tests
- [ ] Email service tests (sending, templates, retries)
- [ ] Permission system tests (all roles × resources)
- [ ] Invitation flow tests (create, accept, expire)
- [ ] Multi-company tests (data isolation, switching)
- [ ] Target: 80%+ code coverage

#### Task 7.1.2: Integration Tests
- [ ] Full registration → verification → login flow
- [ ] Password reset end-to-end
- [ ] Team invitation and acceptance
- [ ] Company switching and data isolation
- [ ] Permission enforcement across endpoints

#### Task 7.1.3: Security Testing
- [ ] SQL injection prevention
- [ ] XSS protection in emails and forms
- [ ] CSRF token validation
- [ ] Rate limiting on sensitive endpoints
- [ ] JWT token security (expiration, refresh)

### 7.2 Frontend Testing

#### Task 7.2.1: Component Tests
- [ ] Profile editing component
- [ ] Password change modal
- [ ] Team management table
- [ ] Company switcher dropdown
- [ ] Permission-based rendering

#### Task 7.2.2: E2E Tests (Playwright/Cypress)
- [ ] User registration and verification
- [ ] Login and logout
- [ ] Profile editing
- [ ] Team invitation flow
- [ ] Company switching

### 7.3 Performance Testing

#### Task 7.3.1: Load Testing
- [ ] 100 concurrent users registration
- [ ] 1000 concurrent API requests
- [ ] Email sending performance (100+ emails/min)
- [ ] Database query optimization

#### Task 7.3.2: Email Deliverability Testing
- [ ] Test delivery to Gmail, Outlook, Yahoo
- [ ] Check spam scores (mail-tester.com)
- [ ] Verify SPF, DKIM, DMARC records
- [ ] Monitor bounce rates

**Deliverables**:
- ✅ 80%+ test coverage
- ✅ All critical flows tested end-to-end
- ✅ Security audit passed
- ✅ Performance benchmarks met

**Timeline**: 3-4 days  
**Priority**: HIGH (quality gate)

---

## Phase 8: Documentation & Deployment 📚

**Goal**: Comprehensive documentation for developers, admins, and end-users

### 8.1 Developer Documentation

#### Task 8.1.1: API Documentation
- [ ] Update OpenAPI/Swagger schemas
- [ ] Document all new endpoints
- [ ] Add request/response examples
- [ ] Include error codes and handling

#### Task 8.1.2: Self-Hosted Email Guide
- [ ] MailHog setup for development
- [ ] Postfix production deployment guide
- [ ] DNS configuration (SPF, DKIM, DMARC)
- [ ] Troubleshooting common issues
- [ ] Monitoring and maintenance

#### Task 8.1.3: Architecture Documentation
- [ ] Update system architecture diagrams
- [ ] Document permission system design
- [ ] Multi-company data flow
- [ ] Email verification sequence diagrams

### 8.2 Admin Documentation

#### Task 8.2.1: Deployment Guides
- [ ] Production checklist
- [ ] Environment variables reference
- [ ] Database migrations guide
- [ ] Email server setup
- [ ] Monitoring and logging

#### Task 8.2.2: Configuration Guides
- [ ] Role and permission setup
- [ ] Email template customization
- [ ] Company creation and management
- [ ] Backup and disaster recovery

### 8.3 User Documentation

#### Task 8.3.1: User Guides
- [ ] Getting started guide
- [ ] Email verification process
- [ ] Profile management
- [ ] Team collaboration
- [ ] Company switching

#### Task 8.3.2: FAQ
- [ ] Common issues and solutions
- [ ] Email verification troubleshooting
- [ ] Password reset help
- [ ] Permission questions

**Deliverables**:
- ✅ Complete API documentation
- ✅ Self-hosted email deployment guide
- ✅ Admin and user manuals
- ✅ FAQ and troubleshooting

**Timeline**: 2-3 days  
**Priority**: MEDIUM (essential for handoff)

---

## Implementation Timeline Summary

| Phase | Duration | Dependencies | Priority |
|-------|----------|--------------|----------|
| 1. Self-Hosted Email | 1-2 days | None | HIGH |
| 2. Email Verification | 2-3 days | Phase 1 | HIGH |
| 3. User Profiles | 2-3 days | Phase 2 | MEDIUM |
| 4. Team Collaboration | 3-4 days | Phase 2, 3 | MEDIUM |
| 5. Advanced Permissions | 4-5 days | Phase 4 | MEDIUM |
| 6. Multi-Company Support | 4-5 days | Phase 5 | LOW |
| 7. Testing & QA | 3-4 days | All phases | HIGH |
| 8. Documentation | 2-3 days | All phases | MEDIUM |

**Total Estimated Time**: 21-29 days (4-6 weeks)

**Critical Path**: Phase 1 → Phase 2 → Phase 7 (core functionality)  
**Optional Path**: Phase 3 → Phase 4 → Phase 5 → Phase 6 (advanced features)

---

## Resource Requirements

### Infrastructure
- **Development**: MailHog (Docker), SQLite/PostgreSQL
- **Staging**: VPS for Postfix ($5-10/month), PostgreSQL
- **Production**: Email server ($10-20/month) OR managed SMTP relay

### Third-Party Services (Optional)
- **Alternative to self-hosted email**: 
  - Mailgun (pay-as-you-go, $0.80 per 1000 emails)
  - Postmark (transactional specialist, $10/month for 10k emails)
  - Amazon SES ($0.10 per 1000 emails)

### Development Resources
- 1 full-stack developer (primary)
- 1 DevOps engineer (email server setup, part-time)
- 1 QA engineer (testing phase)

---

## Success Criteria

### Must-Have (MVP for Production)
- ✅ Email verification working with self-hosted SMTP
- ✅ Password reset functional
- ✅ User profile editing
- ✅ Basic team invitations
- ✅ Data security and isolation
- ✅ 80%+ test coverage

### Nice-to-Have (Post-Launch)
- 📋 Advanced permission customization
- 📋 Multi-company switching
- 📋 Avatar uploads
- 📋 User preferences
- 📋 Audit logs

### Future Enhancements
- 📋 SSO/SAML integration
- 📋 2FA/MFA
- 📋 API rate limiting per user
- 📋 Webhook notifications
- 📋 Advanced analytics on user activity

---

## Risk Assessment

### High Risk
- **Email Deliverability**: Self-hosted SMTP may have lower delivery rates
  - **Mitigation**: Proper SPF/DKIM/DMARC, IP warm-up, fallback to managed service
  
- **Data Security**: Multi-company data leakage
  - **Mitigation**: Thorough testing, row-level security, audit logging

### Medium Risk
- **Migration**: Moving from single to multi-company model
  - **Mitigation**: Careful migration scripts, backup strategy, rollback plan

- **Performance**: Permission checks on every request
  - **Mitigation**: Caching, database indexing, query optimization

### Low Risk
- **UI Complexity**: Too many features overwhelming users
  - **Mitigation**: Progressive disclosure, optional features, good UX

---

## Next Steps (Immediate Actions)

1. ✅ **Approve Roadmap**: Review and confirm priorities
2. 🔧 **Start Phase 1**: Set up MailHog for development
3. 📋 **Create Sprint Plan**: Break Phase 1-2 into 2-week sprint
4. 🎯 **Assign Resources**: Developer, DevOps, QA roles
5. 📊 **Set Up Tracking**: GitHub Projects or Jira for task management

---

## Conclusion

This roadmap transforms the alpha platform into a production-ready enterprise solution. The modular approach allows for incremental delivery:

- **Weeks 1-2**: Core email infrastructure (Phases 1-2)
- **Weeks 3-4**: User management and collaboration (Phases 3-4)
- **Weeks 5-6**: Advanced features and testing (Phases 5-7)
- **Week 7**: Documentation and launch prep (Phase 8)

The self-hosted email solution provides cost savings and control, while the progressive feature rollout ensures stability and quality at each stage.

**Ready to begin implementation!** 🚀
