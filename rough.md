# DWA Website – Homepage Redesign & Refinement Instructions (Version 2)

## 1. Project Objective

Refine the existing Dalit Welfare Association (DWA) website, beginning with `index.html`.

The objective is to transform the current homepage into a sophisticated, minimalist, editorial-style institutional website inspired by leading international foundations, research institutions and established nonprofit organisations.

The new visual direction should communicate:

- Institutional credibility
    
- Human dignity
    
- Simplicity and confidence
    
- Transparency and accountability
    
- Long-standing grassroots experience
    
- Emotional connection through authentic documentary photography
    

**Do not rebuild the website from scratch.** Inspect the existing codebase, preserve useful components and functionality, and implement the changes below.

The existing factual information is verified and up to date. Preserve it exactly unless a change is explicitly requested.

---

## 2. New Visual Identity – Monochrome Editorial Design

Move away from the previous green, blue and yellow colour combination.

Adopt a predominantly monochrome visual system.

### Colour palette

|Element|Colour|
|---|---|
|Primary background|#FFFFFF|
|Secondary background|#F5F5F3|
|Primary text|#171717|
|Secondary text|#626262|
|Borders and dividers|#E5E5E5|
|Primary accent red|#B5121B|
|Dark red hover|#8F0E16|

Red must be used very sparingly.

Use it for:

- Main Donate buttons
    
- Selected menu indicators
    
- Small editorial highlights
    
- Important calls to action
    
- Occasional subtle visual markers
    

Do not use red as a dominant background colour.

The overall impression should be approximately 90% monochrome with a very restrained red accent.

### Photography direction

- Preserve the natural colours of authentic DWA field photographs.
    
- Allow documentary photography to provide visual richness and emotional depth.
    
- Do not apply unnecessary filters or colour overlays.
    
- Monochrome photography may be used selectively for editorial storytelling.
    
- Never use stock photographs or AI-generated beneficiary photographs.
    

### Design principles

- Sharp, square edges throughout.
    
- No rounded cards, buttons, containers or image holders.
    
- Avoid excessive shadows and gradients.
    
- Avoid unnecessary decorative icons.
    
- Generous white space.
    
- Large editorial typography.
    
- Strong alignment and visual hierarchy.
    
- Subtle borders and dividers.
    
- Avoid the generic NGO template and SaaS dashboard appearance.
    

Retain the existing serif heading and sans-serif body font direction. The current typography is approved.

---

## 3. Logo Refinement

The existing DWA logo is displayed inside a circular frame.

Change the presentation to a full square logo.

Requirements:

- Use the official DWA logo artwork.
    
- Display the complete logo inside a square canvas.
    
- Remove circular clipping, circular borders and circular containers.
    
- Preserve the original logo proportions.
    
- Do not stretch or crop the logo.
    
- Use a clean white or transparent square background depending on the original logo artwork.
    
- Apply the same square presentation in the desktop header, mobile navigation and footer.
    

Do not redesign the actual logo without approval.

---

## 4. Header and Navigation Redesign

Retain the existing main navigation structure and typography, but refine the navigation behaviour.

### Desktop header

- Display the square DWA logo and organisation name on the left.
    
- Keep the header minimal and clean.
    
- Remove the standalone Home button/link from the visible primary navigation.
    
- The logo should link to `index.html`.
    
- Keep the following main navigation items:
    
    1. About
        
    2. Programs
        
    3. Accountability
        
    4. Donate
        
- Add a separate Menu button on the right.
    

The Donate button should use the restrained accent red.

### Full-screen Menu Overlay

Create a dedicated full-screen navigation overlay that opens when the user clicks Menu.

This should not be an ordinary dropdown.

It should cover the entire viewport and present a structured overview of the website.

Include:

**Main navigation**

- Home
    
- About
    
- Programs
    
- Accountability
    
- Donate
    

**About subsections**

- Our History
    
- Vision and Mission
    
- Organisation and Leadership
    
- Our Approach
    
- Institutional Credentials
    
- Partners and Collaborations
    

**Programs subsections**

- Women's Empowerment and Livelihoods
    
- Child Education
    
- Water Conservation
    
- Community Development
    

**Accountability subsections**

- Legal and Statutory Documents
    
- Financial Reports and Audits
    
- Previous Projects
    
- Ongoing Projects
    
- Events and Activities
    
- Gallery and Impact
    
- Policies and Disclosures
    

**Donate subsections**

- Domestic Donations
    
- International Giving
    
- CSR Partnerships
    
- Institutional Grants
    
- Volunteer and Collaborate
    

Use a clean multi-column editorial layout on desktop.

On mobile, stack the sections vertically with collapsible subsections if necessary.

### Menu interaction requirements

- Include a clearly visible close button.
    
- Close when Escape is pressed.
    
- Close when the user clicks the close control.
    
- Provide proper keyboard navigation.
    
- Manage keyboard focus appropriately while open.
    
- Prevent background scrolling while the menu is open.
    
- Restore focus to the Menu button after closing.
    
- Ensure all navigation links point to actual page sections.
    
- Use accessible labels and appropriate dialog/navigation semantics.
    

The overlay should feel elegant, spacious and institutional rather than like a conventional mobile menu.

---

## 5. Homepage – New Content Structure

The homepage must become significantly shorter and more focused.

Remove the current long sequence of content cards and repeated explanatory sections.

The new homepage must contain only the following major sections, in this order.

### Section 1: Full-Screen Editorial Hero

This is the most important section.

Create a full-viewport-height hero section, approximately 90–100vh on desktop.

Use a two-column layout.

**Left column – Text**

Include:

- A small institutional eyebrow, such as "Working in Andhra Pradesh Since 1993".
    
- One strong editorial headline.
    
- A concise description of DWA's purpose and work.
    
- Two prominent call-to-action buttons.
    

Suggested headline:

"Building Dignity. Creating Opportunity. Strengthening Communities."

Suggested introductory text:

"Since 1993, Dalit Welfare Association has worked alongside rural and marginalized communities in Andhra Pradesh, advancing sustainable livelihoods, women's empowerment, child education and community-led development."

Buttons:

- Explore Our Work
    
- Support Our Mission
    

The primary button should use accent red. The secondary button should be monochrome and understated.

**Right column – Documentary photograph**

- Large rectangular photograph holder.
    
- Sharp corners.
    
- Generous dimensions.
    
- No decorative overlays.
    
- Maintain a strong editorial composition.
    

On mobile, stack the text and photograph naturally without making the section excessively tall.

The hero should feel like the opening page of a serious international foundation's annual publication.

### Section 2: Impact Number Meter

Immediately after the hero, introduce a clean horizontal number meter.

Use a restrained editorial design with large numbers and small supporting descriptions.

Potential metrics:

- Years of Community Service
    
- 300+ Women Supported
    
- 500+ Children Reached
    
- 1000+ Community Members
    

The numbers should remain visible and readable even if JavaScript is disabled.

Use a simple horizontal layout with thin vertical dividers.

### Section 3: Vision and Mission

Create a minimal two-column editorial section.

Left:

- Vision
    

Right:

- Mission
    

Use large serif headings and concise paragraphs.

Avoid cards and decorative icons.

Give this section generous whitespace and a subtle background contrast if appropriate.

### Section 4: Featured Programs

Show the four priority programme areas:

1. Women's Empowerment and Livelihoods
    
2. Child Education and Advancement
    
3. Water Conservation and Climate Adaptation
    
4. Community Development and Welfare
    

Use a refined editorial grid.

Each programme should include:

- Programme name
    
- Concise description
    
- Documentary photograph holder
    
- Text link to its corresponding section on `programs.html`
    

Do not reproduce lengthy programme descriptions from the previous homepage.

Use clean image-and-text compositions rather than rounded cards.

### Section 5: Institutional Credentials

Create a compact institutional credibility section.

Present verified credentials in a clean, structured layout:

- Society Registration
    
- FCRA Registration
    
- NGO Darpan
    
- PAN
    
- Relevant statutory registrations
    

Include the established year, 1993.

Provide a link to the Accountability page for complete public documentation.

Do not make this section look like a collection of badges. Use typography, whitespace and subtle dividers.

### Section 6: International Visitors – Benevity

Create a separate, visually distinctive section for international visitors and corporate employees who wish to support DWA.

Suggested heading:

"Supporting DWA from Around the World"

Suggested text:

"If you are visiting from outside India or looking to support grassroots development through your employer, you may be able to contribute to DWA through Benevity, subject to platform availability and eligibility."

Include:

- A clear explanation of Benevity as a corporate giving and employee donation platform.
    
- A dedicated Donate Through Benevity button.
    
- A short note that international contributions must use authorised channels and comply with applicable Indian FCRA requirements.
    

Use a subtle monochrome background with a small red accent.

Important:

- Link to DWA's actual verified Benevity profile or approved giving page.
    
- Do not invent a Benevity URL.
    
- If the correct URL is not yet available, use a clearly identified configuration placeholder and flag it for DWA approval.
    
- Do not imply that all international visitors or employers are eligible.
    

### Section 7: Newsletter Subscription

Add a simple newsletter section near the bottom of the homepage.

Suggested heading:

"Stay Connected With Our Work"

Suggested description:

"Receive occasional updates on DWA's programmes, community initiatives, achievements and opportunities to collaborate."

Include:

- Email address field
    
- Subscribe button
    
- Privacy consent statement
    
- Link to Privacy Policy
    

Requirements:

- Use a real backend or approved email marketing integration before enabling actual subscriptions.
    
- Validate email addresses.
    
- Include spam protection.
    
- Do not collect unnecessary personal information.
    
- Never display a success message unless the subscription has actually been accepted.
    
- If backend integration is not yet configured, implement the visual interface without pretending that subscriptions are being stored.
    

### Section 8: Footer

Create a clean, spacious institutional footer.

Include:

**Organisation**

- DWA square logo
    
- Short organisation description
    
- Established year
    

**Navigation**

- About
    
- Programs
    
- Accountability
    
- Donate
    

**Contact**

- Registered office address
    
- Official email address
    

**Social Media**

- Display official social media icons for the organisation's verified accounts.
    
- Use clean monochrome icons.
    
- On hover, subtle accent red is permitted.
    
- Do not invent social media profile URLs.
    
- If account URLs are unavailable, leave clearly identified configuration placeholders.
    

**Policies**

- Privacy Policy
    
- Refund and Cancellation Policy
    

Both policy links must open accessible popup modals rather than navigating away from the homepage.

Modal requirements:

- Large, readable content area.
    
- Sharp corners.
    
- Close button.
    
- Escape key support.
    
- Background overlay.
    
- Keyboard focus management.
    
- Scrollable content when necessary.
    
- Proper mobile responsiveness.
    

Policy text must be supplied or approved by DWA. Do not invent legal terms.

Include copyright information and a Back to Top link.

---

## 6. General Design and Interaction Rules

- All corners must be square.
    
- Avoid border-radius utilities throughout the homepage.
    
- No excessive shadows.
    
- No gradients.
    
- No decorative animations.
    
- Use subtle hover transitions only.
    
- Keep interactions purposeful.
    
- Maintain responsive layouts across mobile, tablet and desktop.
    
- Follow accessibility standards.
    
- Use semantic HTML5.
    
- Maintain proper heading hierarchy.
    
- Provide visible keyboard focus.
    
- Respect reduced-motion preferences.
    
- Ensure sufficient colour contrast.
    

---

## 7. Technical Requirements

Retain the approved technology stack:

- HTML5
    
- Tailwind CSS
    
- Vanilla JavaScript
    

Production requirements:

- Replace the Tailwind CDN with a locally compiled production CSS file.
    
- Avoid unnecessary JavaScript dependencies.
    
- Keep CSS organised and reusable.
    
- Keep navigation, menu overlay, newsletter interface and policy modals modular.
    
- Optimise images for WebP and AVIF.
    
- Preserve original images.
    
- Use responsive image dimensions and `srcset` where appropriate.
    
- Lazy-load below-the-fold images.
    
- Do not lazy-load the primary hero image unnecessarily.
    
- Specify image width and height to prevent layout shifts.
    
- Maintain SEO metadata and structured data.
    
- Ensure all internal links work.
    
- Avoid exposing API keys or credentials in frontend JavaScript.
    

Do not introduce a new framework or additional technology without approval.

---

## 8. Content Integrity

The existing factual information is approved and up to date.

Therefore:

- Preserve the current organisation details.
    
- Preserve the registration information.
    
- Preserve the donor and project details.
    
- Preserve verified programme information.
    
- Do not invent new impact figures.
    
- Do not change financial figures.
    
- Do not silently rewrite historical facts.
    
- Do not remove legally important information.
    
- Do not publish confidential beneficiary information.
    

The objective is to improve presentation and content hierarchy, not change the organisation's institutional record.

---

## 9. Implementation Workflow

Work in the following sequence.

**Step 1 – Inspect**

- Review the current `index.html`.
    
- Review existing CSS and JavaScript.
    
- Identify reusable components.
    
- Identify existing broken or unused elements.
    

**Step 2 – Homepage redesign**

- Implement the new monochrome design system.
    
- Build the full-screen hero.
    
- Add the impact number meter.
    
- Add vision and mission.
    
- Add featured programmes.
    
- Add institutional credentials.
    
- Add Benevity section.
    
- Add newsletter interface.
    
- Redesign the footer.
    

**Step 3 – Navigation**

- Remove the visible Home navigation item.
    
- Make the logo link to the homepage.
    
- Implement the full-screen menu overlay.
    
- Include all pages and subsections.
    

**Step 4 – Interactions**

- Implement menu behaviour.
    
- Implement policy popup modals.
    
- Implement newsletter form states.
    
- Implement accessible keyboard interactions.
    

**Step 5 – Quality assurance**  
Test:

- Desktop layout
    
- Tablet layout
    
- Mobile layout
    
- Menu overlay
    
- All internal links
    
- Modal behaviour
    
- Keyboard accessibility
    
- Contrast
    
- Page performance
    
- Browser console errors
    

---

## 10. Scope and Approval Gate

For this task, modify the homepage and its directly related CSS and JavaScript only.

Do not redesign About, Programs, Accountability or Donate pages yet.

The navigation overlay may display their planned sections, but links must correspond to the actual existing page structure. If a destination section is not implemented yet, identify it rather than creating misleading links.

Before finishing:

1. Summarise the files changed.
    
2. Explain the main design decisions.
    
3. List any missing assets or configuration values.
    
4. Identify any integrations still requiring credentials or approval.
    
5. Provide a working local preview.
    
6. Stop and wait for DWA's approval before proceeding to the remaining pages.
    

**Final design objective:** A minimalist, monochrome, editorial website with sharp edges, confident typography, authentic documentary photography and rare, intentional red accents. The result should feel timeless, credible, emotionally engaging and worthy of an established international development organisation.