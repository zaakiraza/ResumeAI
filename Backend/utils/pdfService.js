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
        .modern-template .resume-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            margin: -20px -20px 30px -20px;
            border-bottom: none;
        }
        
        .modern-template .resume-name {
            color: white;
        }
        
        .modern-template .section-title {
            color: #667eea;
            border-bottom-color: #667eea;
        }
        
        .modern-template .item-company, .modern-template .item-institution {
            color: #764ba2;
        }
      `,
      
      classic: `
        .classic-template {
            font-family: 'Times New Roman', serif;
        }
        
        .classic-template .resume-header {
            border-bottom: 3px double #2c3e50;
        }
        
        .classic-template .section-title {
            font-family: 'Times New Roman', serif;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
      `,
      
      creative: `
        .creative-template .resume-header {
            background: #ff6b6b;
            color: white;
            padding: 30px;
            margin: -20px -20px 30px -20px;
            border-bottom: none;
            clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
        }
        
        .creative-template .resume-name {
            color: white;
        }
        
        .creative-template .section-title {
            color: #ff6b6b;
            border-bottom-color: #ff6b6b;
        }
        
        .creative-template .skill-item {
            background: #ff6b6b;
            color: white;
            border-color: #ff6b6b;
        }
      `,
      
      minimal: `
        .minimal-template {
            font-family: 'Helvetica Neue', 'Helvetica', sans-serif;
        }
        
        .minimal-template .resume-header {
            border-bottom: 1px solid #ddd;
        }
        
        .minimal-template .section-title {
            color: #333;
            font-weight: 300;
            font-size: 16px;
            border-bottom: 1px solid #eee;
        }
        
        .minimal-template .resume-name {
            font-weight: 300;
        }
      `
    };
    
    return templates[template] || templates.modern;
  }

  /**
   * Generate resume HTML content
   */
  static generateResumeHTML(resumeData, template) {
    const { personalInfo, careerObjective, workExperience, skills, education, certifications, languages, additionalInfo } = resumeData;
    
    return `
    <div class="resume-container">
        <!-- Header Section -->
        <div class="resume-header">
            ${personalInfo?.profilePicture ? `<img src="${personalInfo.profilePicture}" alt="Profile Picture" class="profile-picture">` : ''}
            <h1 class="resume-name">${personalInfo?.fullName || 'Full Name'}</h1>
            <div class="resume-contact">
                ${personalInfo?.email ? `<span>${personalInfo.email}</span>` : ''}
                ${personalInfo?.phone ? ` • <span>${personalInfo.phone}</span>` : ''}
                ${personalInfo?.location ? ` • <span>${personalInfo.location}</span>` : ''}
            </div>
        </div>

        <!-- Career Objective -->
        ${careerObjective ? `
        <div class="resume-section">
            <h2 class="section-title">Career Objective</h2>
            <div class="career-objective">${careerObjective}</div>
        </div>
        ` : ''}

        <!-- Work Experience -->
        ${workExperience && workExperience.length > 0 ? `
        <div class="resume-section">
            <h2 class="section-title">Work Experience</h2>
            ${workExperience.map(work => `
                <div class="work-item">
                    <div class="item-title">${work.jobTitle || 'Job Title'}</div>
                    <div class="item-company">${work.companyName || 'Company Name'}</div>
                    <div class="item-date">${work.startDate || ''} - ${work.currentJob ? 'Present' : (work.endDate || '')}</div>
                    ${work.responsibilities ? `<div class="item-description">${work.responsibilities}</div>` : ''}
                </div>
            `).join('')}
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
        ${education && education.length > 0 ? `
        <div class="resume-section">
            <h2 class="section-title">Education</h2>
            ${education.map(edu => `
                <div class="education-item">
                    <div class="item-title">${edu.degree || 'Degree'}</div>
                    <div class="item-institution">${edu.institution || 'Institution'}</div>
                    <div class="item-date">${edu.graduationYear || 'Year'}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <!-- Certifications -->
        ${certifications && certifications.length > 0 && certifications.some(cert => cert.name) ? `
        <div class="resume-section">
            <h2 class="section-title">Certifications</h2>
            ${certifications.filter(cert => cert.name).map(cert => `
                <div class="certification-item">
                    <div class="item-title">${cert.name}</div>
                    <div class="item-institution">${cert.institution || ''}</div>
                    <div class="item-date">${cert.dateAchieved || ''}</div>
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
        ${additionalInfo ? `
        <div class="resume-section additional-info">
            ${additionalInfo.volunteerExperience ? `
                <div class="additional-section">
                    <div class="additional-title">Volunteer Experience</div>
                    <div class="additional-content">${additionalInfo.volunteerExperience}</div>
                </div>
            ` : ''}
            ${additionalInfo.hobbies ? `
                <div class="additional-section">
                    <div class="additional-title">Hobbies & Interests</div>
                    <div class="additional-content">${additionalInfo.hobbies}</div>
                </div>
            ` : ''}
            ${additionalInfo.projects ? `
                <div class="additional-section">
                    <div class="additional-title">Projects</div>
                    <div class="additional-content">${additionalInfo.projects}</div>
                </div>
            ` : ''}
        </div>
        ` : ''}
    </div>
    `;
  }
}

export default PDFService;