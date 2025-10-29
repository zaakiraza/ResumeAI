import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

/**
 * PDF Service for generating resume PDFs
 */
export class PDFService {
  
  /**
   * Generate PDF from resume data
   * @param {Object} resumeData - Resume data object
   * @param {string} template - Template name (modern, classic, creative, minimal)
   * @returns {Promise<Buffer>} - PDF buffer
   */
  static async generateResumePDF(resumeData, template = 'modern') {
    let browser = null;
    
    try {
            // Prefer serverless-friendly Chromium when running in serverless environments (Vercel, AWS Lambda)
            const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AWS_EXECUTION_ENV);

            if (isServerless) {
                try {
                    // Try to use chrome-aws-lambda and puppeteer-core if available in production
                    const chromium = await import('chrome-aws-lambda');
                    const pptr = await import('puppeteer-core');

                    const executablePath = await chromium.executablePath || chromium.path || null;

                    browser = await pptr.launch({
                        args: chromium.args.concat(['--disable-dev-shm-usage']),
                        defaultViewport: null,
                        executablePath: executablePath || undefined,
                        headless: chromium.headless,
                    });
                } catch (err) {
                    // If serverless-specific packages are not installed, fall back to bundled puppeteer
                    console.warn('chrome-aws-lambda/puppeteer-core not available or failed to launch, falling back to puppeteer:', err?.message || err);
                    browser = await puppeteer.launch({
                        headless: 'new',
                        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
                    });
                }
            } else {
                // Local / non-serverless environment
                browser = await puppeteer.launch({
                    headless: 'new',
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
                });
            }

      const page = await browser.newPage();
      
      // Set page format for resume
      await page.setViewport({
        width: 794,  // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        deviceScaleFactor: 2
      });

      // Generate HTML content based on template
      const htmlContent = this.generateHTMLTemplate(resumeData, template);
      
      // Set HTML content
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });

      return pdfBuffer;

    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Failed to generate PDF: ' + error.message);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate HTML template for PDF
   * @param {Object} resumeData - Resume data
   * @param {string} template - Template name
   * @returns {string} - HTML content
   */
  static generateHTMLTemplate(resumeData, template) {
    const baseCSS = this.getBaseCSS();
    const templateCSS = this.getTemplateCSS(template);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.personalInfo?.fullName || 'Resume'}</title>
    <style>
        ${baseCSS}
        ${templateCSS}
    </style>
</head>
<body class="${template}-template">
    ${this.generateResumeHTML(resumeData, template)}
</body>
</html>`;
  }

  /**
   * Generate base CSS styles
   */
  static getBaseCSS() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.6;
            color: #333;
            font-size: 14px;
        }
        
        .resume-container {
            max-width: 794px;
            margin: 0 auto;
            background: white;
            padding: 20px;
        }
        
        .resume-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        
        .profile-picture {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 15px;
        }
        
        .resume-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        
        .resume-contact {
            font-size: 14px;
            color: #666;
        }
        
        .resume-section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
        }
        
        .work-item, .education-item, .certification-item {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .work-item:last-child, .education-item:last-child, .certification-item:last-child {
            border-bottom: none;
        }
        
        .item-title {
            font-size: 16px;
            font-weight: bold;
            color: #34495e;
            margin-bottom: 5px;
        }
        
        .item-company, .item-institution {
            font-size: 14px;
            color: #3498db;
            font-weight: 500;
            margin-bottom: 5px;
        }
        
        .item-date {
            font-size: 13px;
            color: #777;
            font-style: italic;
            margin-bottom: 8px;
        }
        
        .item-description {
            font-size: 14px;
            color: #555;
            line-height: 1.5;
        }
        
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .skill-item {
            background: #f8f9fa;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 13px;
            color: #495057;
            border: 1px solid #dee2e6;
        }
        
        .languages-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        
        .language-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .language-name {
            font-weight: 500;
        }
        
        .language-proficiency {
            font-size: 12px;
            color: #666;
            background: #e9ecef;
            padding: 2px 8px;
            border-radius: 10px;
        }
        
        .career-objective {
            font-size: 14px;
            line-height: 1.6;
            color: #555;
            font-style: italic;
            padding: 15px;
            background: #f8f9fa;
            border-left: 4px solid #3498db;
            margin-bottom: 20px;
        }
        
        .additional-info {
            margin-top: 20px;
        }
        
        .additional-section {
            margin-bottom: 15px;
        }
        
        .additional-title {
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 8px;
        }
        
        .additional-content {
            font-size: 13px;
            color: #555;
            line-height: 1.5;
        }
    `;
  }

  /**
   * Get template-specific CSS
   */
  static getTemplateCSS(template) {
    const templates = {
      modern: `
        /* Modern Template */
        .modern-template .resume-container {
            padding: 0;
        }
        
        .modern-template .resume-header {
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%);
            color: white;
            margin: 0;
            border-bottom: none;
        }
        
        .modern-template .resume-name {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 10px;
            color: white;
        }
        
        .modern-template .resume-title {
            font-size: 18px;
            margin-bottom: 15px;
            opacity: 0.95;
        }
        
        .modern-template .resume-contact {
            font-size: 14px;
            opacity: 0.95;
            color: white;
        }
        
        .modern-template .resume-links {
            font-size: 13px;
            margin-top: 10px;
            opacity: 0.9;
        }
        
        .modern-template .resume-body {
            padding: 30px;
        }
        
        .modern-template .section-title {
            color: #2563EB;
            font-size: 20px;
            font-weight: 700;
            border-bottom: 3px solid #2563EB;
            padding-bottom: 8px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .modern-template .item-title {
            font-weight: 600;
            font-size: 16px;
            color: #111827;
        }
        
        .modern-template .item-date {
            color: #6b7280;
            font-size: 13px;
            font-style: italic;
            margin: 5px 0 8px;
        }
        
        .modern-template .skill-item {
            background: linear-gradient(135deg, #2563EB, #0EA5E9);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            border: none;
        }
      `,
      
      classic: `
        /* Classic Template */
        .classic-template {
            font-family: 'Georgia', 'Times New Roman', serif;
            color: #000;
            line-height: 1.8;
        }
        
        .classic-template .resume-header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        
        .classic-template .resume-name {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #000;
        }
        
        .classic-template .resume-contact {
            font-size: 14px;
            color: #333;
        }
        
        .classic-template .resume-contact div {
            margin: 5px 0;
        }
        
        .classic-template .section-title {
            font-size: 18px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 15px;
            color: #000;
        }
        
        .classic-template .item-date {
            font-style: italic;
            color: #555;
            font-size: 13px;
            margin: 3px 0 8px;
        }
        
        .classic-template .skill-item {
            background: transparent;
            color: #000;
            border: 1px solid #000;
            padding: 5px 10px;
        }
      `,
      
      creative: `
        /* Creative Template */
        .creative-template .resume-container {
            display: flex;
            padding: 0;
            max-width: 100%;
        }
        
        .creative-template .creative-sidebar {
            width: 35%;
            background: linear-gradient(180deg, #2563EB 0%, #1e40af 100%);
            color: white;
            padding: 30px 20px;
        }
        
        .creative-template .sidebar-name {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 30px;
            word-wrap: break-word;
        }
        
        .creative-template .sidebar-section {
            margin-bottom: 25px;
        }
        
        .creative-template .sidebar-section h4 {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            border-bottom: 2px solid rgba(255,255,255,0.3);
            padding-bottom: 8px;
        }
        
        .creative-template .sidebar-section p {
            font-size: 13px;
            margin: 5px 0;
            line-height: 1.5;
        }
        
        .creative-template .creative-main {
            flex: 1;
            padding: 30px;
            background: white;
        }
        
        .creative-template .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #2563EB;
            margin-bottom: 15px;
            position: relative;
            padding-left: 15px;
        }
        
        .creative-template .section-title::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #2563EB, #0EA5E9);
        }
        
        .creative-template .item-company {
            color: #6b7280;
            font-size: 13px;
            margin-bottom: 8px;
        }
        
        .creative-template .skill-item {
            background: white;
            color: #2563EB;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 5px 10px;
        }
      `,
      
      minimal: `
        /* Minimal Template */
        .minimal-template {
            font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
            color: #000;
            line-height: 1.6;
        }
        
        .minimal-template .resume-header {
            border-bottom: 4px solid #000;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        
        .minimal-template .resume-name {
            font-size: 36px;
            font-weight: 300;
            letter-spacing: -1px;
            margin-bottom: 10px;
            color: #000;
        }
        
        .minimal-template .resume-contact {
            font-size: 13px;
            color: #333;
        }
        
        .minimal-template .section-title {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
            color: #000;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        
        .minimal-template .item-title {
            font-weight: 600;
            font-size: 15px;
        }
        
        .minimal-template .item-date {
            font-size: 12px;
            color: #666;
            font-style: normal;
        }
        
        .minimal-template .item-company {
            color: #666;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .minimal-template .skill-item {
            background: transparent;
            border: 1px solid #ddd;
            color: #000;
            padding: 5px 10px;
        }
      `
    };
    
    return templates[template] || templates.modern;
  }

  /**
   * Generate resume HTML content
   */
  static generateResumeHTML(resumeData, template) {
    if (template === 'creative') {
      return this.generateCreativeTemplate(resumeData);
    }
    
    const { personalInfo, title, careerObjective, workExperience, skills, education, certifications, languages, additionalInfo } = resumeData;
    
    return `
    <div class="resume-container">
        <!-- Header Section -->
        <div class="resume-header">
            ${personalInfo?.profilePicture ? `<img src="${personalInfo.profilePicture}" alt="Profile Picture" class="profile-picture">` : ''}
            <h1 class="resume-name">${personalInfo?.fullName || 'Full Name'}</h1>
            ${title ? `<div class="resume-title">${title}</div>` : ''}
            <div class="resume-contact">
                ${personalInfo?.email ? `<span>${personalInfo.email}</span>` : ''}
                ${personalInfo?.phone ? ` • <span>${personalInfo.phone}</span>` : ''}
                ${personalInfo?.location ? ` • <span>${personalInfo.location}</span>` : ''}
            </div>
            ${personalInfo?.links && personalInfo.links.length > 0 ? `
            <div class="resume-links">
                ${personalInfo.links.filter(link => link.label && link.url).map(link => 
                    `<span>${link.label}</span>`
                ).join(' | ')}
            </div>
            ` : ''}
        </div>

        <div class="resume-body">
            <!-- Career Objective -->
            ${careerObjective ? `
            <div class="resume-section">
                <h2 class="section-title">Professional Summary</h2>
                <div class="career-objective">${careerObjective}</div>
            </div>
            ` : ''}

            <!-- Work Experience -->
            ${workExperience && workExperience.length > 0 && workExperience[0].jobTitle ? `
            <div class="resume-section">
                <h2 class="section-title">Work Experience</h2>
                ${workExperience.map(work => work.jobTitle ? `
                    <div class="work-item">
                        <div class="item-title">${work.jobTitle} - ${work.companyName || ''}</div>
                        <div class="item-date">${work.startDate || ''} - ${work.currentJob ? 'Present' : (work.endDate || 'Present')}</div>
                        ${work.responsibilities ? `<div class="item-description">${work.responsibilities.replace(/\n/g, '<br>')}</div>` : ''}
                    </div>
                ` : '').join('')}
            </div>
            ` : ''}

            <!-- Skills -->
            ${skills && skills.length > 0 ? `
            <div class="resume-section">
                <h2 class="section-title">Skills</h2>
                <div class="skills-list">
                    ${skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Education -->
            ${education && education.length > 0 && education[0].degree ? `
            <div class="resume-section">
                <h2 class="section-title">Education</h2>
                ${education.map(edu => edu.degree ? `
                    <div class="education-item">
                        <div class="item-title">${edu.degree}</div>
                        <div class="item-date">${edu.institution || ''} | ${edu.graduationYear || ''}</div>
                        ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
                    </div>
                ` : '').join('')}
            </div>
            ` : ''}

            <!-- Certifications -->
            ${certifications && certifications.length > 0 && certifications.some(cert => cert.name) ? `
            <div class="resume-section">
                <h2 class="section-title">Certifications</h2>
                ${certifications.filter(cert => cert.name).map(cert => `
                    <div class="certification-item">
                        <div class="item-title">${cert.name}</div>
                        <div class="item-date">${cert.institution || ''} | ${cert.dateAchieved || ''}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Languages -->
            ${languages && languages.length > 0 && languages.some(lang => lang.name) ? `
            <div class="resume-section">
                <h2 class="section-title">Languages</h2>
                <div class="languages-list">
                    ${languages.filter(lang => lang.name).map(lang => `
                        <div class="language-item">
                            <span class="language-name">${lang.name}</span>
                            <span class="language-proficiency">${lang.proficiency || 'Proficient'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Additional Information -->
            ${additionalInfo && (additionalInfo.volunteerExperience || additionalInfo.hobbies || additionalInfo.projects) ? `
            <div class="resume-section additional-info">
                ${additionalInfo.volunteerExperience ? `
                    <div class="additional-section">
                        <div class="additional-title">Volunteer Experience</div>
                        <div class="additional-content">${additionalInfo.volunteerExperience.replace(/\n/g, '<br>')}</div>
                    </div>
                ` : ''}
                ${additionalInfo.projects ? `
                    <div class="additional-section">
                        <div class="additional-title">Projects</div>
                        <div class="additional-content">${additionalInfo.projects.replace(/\n/g, '<br>')}</div>
                    </div>
                ` : ''}
                ${additionalInfo.hobbies ? `
                    <div class="additional-section">
                        <div class="additional-title">Hobbies & Interests</div>
                        <div class="additional-content">${additionalInfo.hobbies}</div>
                    </div>
                ` : ''}
            </div>
            ` : ''}
        </div>
    </div>
    `;
  }

  /**
   * Generate Creative Template with Sidebar Layout
   */
  static generateCreativeTemplate(resumeData) {
    const { personalInfo, title, careerObjective, workExperience, skills, education, certifications, languages } = resumeData;
    
    return `
    <div class="resume-container">
        <!-- Sidebar -->
        <div class="creative-sidebar">
            <div class="sidebar-name">${personalInfo?.fullName || 'Your Name'}</div>
            
            <!-- Contact Section -->
            <div class="sidebar-section">
                <h4>Contact</h4>
                ${personalInfo?.email ? `<p>${personalInfo.email}</p>` : ''}
                ${personalInfo?.phone ? `<p>${personalInfo.phone}</p>` : ''}
                ${personalInfo?.location ? `<p>${personalInfo.location}</p>` : ''}
            </div>

            <!-- Links Section -->
            ${personalInfo?.links && personalInfo.links.some(link => link.label && link.url) ? `
            <div class="sidebar-section">
                <h4>Links</h4>
                ${personalInfo.links.filter(link => link.label && link.url).map(link => 
                    `<p>${link.label}</p>`
                ).join('')}
            </div>
            ` : ''}

            <!-- Skills Section -->
            ${skills && skills.length > 0 ? `
            <div class="sidebar-section">
                <h4>Skills</h4>
                ${skills.map(skill => `<p>• ${skill}</p>`).join('')}
            </div>
            ` : ''}

            <!-- Languages Section -->
            ${languages && languages.length > 0 && languages.some(lang => lang.name) ? `
            <div class="sidebar-section">
                <h4>Languages</h4>
                ${languages.filter(lang => lang.name).map(lang => 
                    `<p>${lang.name} - ${lang.proficiency || 'Proficient'}</p>`
                ).join('')}
            </div>
            ` : ''}
        </div>

        <!-- Main Content -->
        <div class="creative-main">
            ${title ? `<h2 style="color: #2563EB; font-size: 22px; margin-bottom: 25px;">${title}</h2>` : ''}

            <!-- Career Objective -->
            ${careerObjective ? `
            <div class="resume-section">
                <h2 class="section-title">About Me</h2>
                <p>${careerObjective}</p>
            </div>
            ` : ''}

            <!-- Work Experience -->
            ${workExperience && workExperience.length > 0 && workExperience[0].jobTitle ? `
            <div class="resume-section">
                <h2 class="section-title">Experience</h2>
                ${workExperience.map(work => work.jobTitle ? `
                    <div class="work-item">
                        <div class="item-title">${work.jobTitle}</div>
                        <div class="item-company">${work.companyName || ''} | ${work.startDate || ''} - ${work.currentJob ? 'Present' : (work.endDate || 'Present')}</div>
                        ${work.responsibilities ? `<div class="item-description">${work.responsibilities.replace(/\n/g, '<br>')}</div>` : ''}
                    </div>
                ` : '').join('')}
            </div>
            ` : ''}

            <!-- Education -->
            ${education && education.length > 0 && education[0].degree ? `
            <div class="resume-section">
                <h2 class="section-title">Education</h2>
                ${education.map(edu => edu.degree ? `
                    <div class="education-item">
                        <div class="item-title">${edu.degree}</div>
                        <div class="item-company">${edu.institution || ''} | ${edu.graduationYear || ''}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                    </div>
                ` : '').join('')}
            </div>
            ` : ''}

            <!-- Certifications -->
            ${certifications && certifications.length > 0 && certifications.some(cert => cert.name) ? `
            <div class="resume-section">
                <h2 class="section-title">Certifications</h2>
                ${certifications.filter(cert => cert.name).map(cert => `
                    <div class="certification-item">
                        <div class="item-title">${cert.name}</div>
                        <div class="item-company">${cert.institution || ''} | ${cert.dateAchieved || ''}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    </div>
    `;
  }
}

export default PDFService;