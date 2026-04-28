# User Story
User stories capture requirements from the end-user perspective. They feed into the spec and can also be derived from it.

### Specification
**User story format:**
```markdown
## User Story: [Feature Name]
**As a** [type of user],
**I want to** [perform some action],
**So that** [benefit/value is realized].
```

## Examples

### Password Reset
**As a** registered user,
**I want to** reset my password via email,
**So that** I can regain access to my account if I forget my password.

### Additional Notes
- Edge cases to consider
- Dependencies
- Design references

### Acceptance Criteria
- [ ] Given I am on the login page, when I click "Forgot Password", then I see a reset form
- [ ] Given I enter my email, when I submit the form, then I receive a reset link
- [ ] Given I click the reset link, when I enter a new password, then my password is updated
