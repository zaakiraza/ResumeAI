# PDF Download & Preview Troubleshooting Guide

## ✅ What Was Fixed/Added

### 1. Preview Page Created
- **Location:** `frontend/src/pages/ProtectedPages/ViewResumePDF/ViewResumePDF.jsx`
- **Features:**
  - Full-screen PDF preview using iframe
  - Download button
  - Edit button (navigate to edit page)
  - Print button
  - Share button (uses Web Share API or copies link)
  - Responsive design
  - Loading states
  - Error handling with fallback to download

### 2. Route Added
- **Path:** `/view-resume/:id`
- **Protection:** Protected route (requires authentication)
- **Navigation:** Added to dashboard navbar allowed routes

### 3. View Button Added to MyResumes
- **Location:** Resume card footer
- **Action:** Navigates to `/view-resume/:id`
- **Styling:** Green hover effect to distinguish from Edit button

## 🔍 PDF Download Issues - Common Causes

### Issue 1: "New resumes are not downloading"

**Possible Causes:**

1. **PDF Not Generated Yet**
   - When a resume is created, the PDF is generated on-demand
   - First download might take longer (5-10 seconds)
   - Cloudinary upload happens after first download

2. **Browser Blocking Downloads**
   - Check if browser is blocking pop-ups/downloads
   - Look for download blocker icon in address bar
   - Check browser download settings

3. **Authentication Token Expired**
   - Token might have expired
   - User needs to log out and log in again
   - Check localStorage for valid token

4. **Backend PDF Generation Failed**
   - Check backend console logs
   - Puppeteer might have crashed
   - Memory issues on Vercel serverless

5. **Content-Disposition Header Missing**
   - Browser doesn't know it's a download
   - File opens in browser instead of downloading

### Testing Downloads

**1. Test in Browser Console:**
```javascript
// Check if resume API is accessible
const resumeId = 'YOUR_RESUME_ID';
const token = localStorage.getItem('token');

fetch(`http://localhost:5003/api/resumes/${resumeId}/pdf`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => {
  console.log('Status:', response.status);
  console.log('Headers:', [...response.headers.entries()]);
  return response.blob();
})
.then(blob => {
  console.log('PDF size:', blob.size, 'bytes');
  console.log('PDF type:', blob.type);
})
.catch(error => console.error('Error:', error));
```

**2. Check Backend Response:**
```bash
# In terminal (replace TOKEN and RESUME_ID)
curl -v -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5003/api/resumes/RESUME_ID/pdf \
  -o test.pdf
```

**Expected Response:**
```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="Resume_modern.pdf"
Content-Length: 123456
```

### Backend Debugging

**Check Backend Logs:**
```javascript
// In Backend/controllers/resumeController.js - downloadResumePDF function
console.log('PDF Generation Started:', {
  resumeId: id,
  userId,
  template: selectedTemplate,
  resumeTitle: resume.title
});

const pdfBuffer = await PDFService.generateResumePDF(resume, selectedTemplate);

console.log('PDF Generated:', {
  bufferSize: pdfBuffer.length,
  bufferType: typeof pdfBuffer
});
```

**Check Puppeteer:**
```javascript
// In Backend/utils/pdfService.js
console.log('Launching browser...', {
  isServerless: process.env.VERCEL ? 'Yes' : 'No',
  nodeEnv: process.env.NODE_ENV
});

browser = await puppeteer.launch({...});

console.log('Browser launched successfully');
```

## 🛠️ Quick Fixes

### Fix 1: Force Download with JavaScript
If Content-Disposition doesn't work:

```javascript
// In frontend/src/services/resumeAPI.js - downloadPDF method
const blob = await response.blob();

// Force download even if Content-Disposition is missing
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `Resume_${Date.now()}.pdf`; // Fallback filename
link.style.display = 'none';
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
window.URL.revokeObjectURL(url);
```

### Fix 2: Add Download Timeout
If download takes too long:

```javascript
// In frontend/src/hooks/useResume.js
const downloadPDF = useCallback(async (resumeId, template = null) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const result = await ResumeAPI.downloadPDF(resumeId, template, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    return result;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Download timeout. Please try again.');
    }
    throw error;
  }
}, []);
```

### Fix 3: Better Error Messages

```javascript
// In frontend/src/pages/ProtectedPages/MyResumes/MyResumes.jsx
const handleDownloadResume = async (resumeId, template) => {
  setDownloadInProgress(resumeId);
  
  try {
    await downloadPDF(resumeId, template);
    toast.success('Resume downloaded successfully!');
  } catch (error) {
    console.error('Download error:', error);
    
    // More specific error messages
    if (error.message.includes('404')) {
      toast.error('Resume not found. Please refresh and try again.');
    } else if (error.message.includes('401')) {
      toast.error('Session expired. Please log in again.');
    } else if (error.message.includes('timeout')) {
      toast.error('Download timeout. The file might be too large. Please try again.');
    } else {
      toast.error('Failed to download resume. Please try again.');
    }
  } finally {
    setDownloadInProgress(null);
  }
};
```

## 🧪 Testing Checklist

### Test New Resumes
- [ ] Create a new resume
- [ ] Fill in all required fields
- [ ] Save the resume
- [ ] Click "Download" button
- [ ] Verify PDF downloads
- [ ] Check PDF content is correct
- [ ] Try different templates

### Test Preview Page
- [ ] Click "View" button on a resume
- [ ] Verify PDF loads in iframe
- [ ] Click "Download" button
- [ ] Click "Print" button
- [ ] Click "Share" button
- [ ] Click "Edit" button
- [ ] Click "Back" button

### Test Existing Resumes
- [ ] Open My Resumes page
- [ ] Try downloading an old resume
- [ ] Try downloading a newly created resume
- [ ] Try downloading with different templates

### Test Error Cases
- [ ] Try downloading without authentication
- [ ] Try downloading non-existent resume
- [ ] Try downloading with invalid template
- [ ] Check error messages are helpful

## 📋 How to Use Preview Page

### From My Resumes Page:
1. Click the **View** button (eye icon) on any resume card
2. Preview page opens showing the PDF
3. Use action buttons: Edit, Print, Share, Download
4. Click "Back" to return to My Resumes

### Direct URL:
```
/view-resume/:resumeId
```

Example:
```
http://localhost:5173/view-resume/65abc123def456789
```

## 🔧 Environment Variables Check

Make sure these are set:

### Frontend (.env.development)
```env
VITE_BACKEND_URL=http://localhost:5003/api
VITE_FRONTEND_URL=http://localhost:5173/
```

### Frontend (.env.production)
```env
VITE_BACKEND_URL=https://resume-backend-roan-nu.vercel.app/api
VITE_FRONTEND_URL=https://resume-frontend-ruby.vercel.app/
```

### Backend (.env)
```env
NODE_ENV=development
OPENAI_API_KEY=your_key_here
FRONTEND_URL=http://localhost:5173
# ... other vars
```

## 🚀 Deployment

After testing locally:

```bash
# Frontend
cd frontend
npm run build
vercel --prod

# Backend (if changes made)
cd Backend
vercel --prod
```

## 📞 Still Having Issues?

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Try downloading
4. Look for errors

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try downloading
4. Look for failed requests (red)
5. Click on the request to see details

### Check Backend Logs
1. If local: Check terminal where backend is running
2. If production: Check Vercel dashboard → Your Project → Deployments → Logs

### Common Error Messages

**"Failed to download PDF"**
- Backend can't generate PDF
- Check Puppeteer is installed
- Check memory limits

**"Resume not found"**
- Invalid resume ID
- Resume was deleted
- User doesn't own this resume

**"401 Unauthorized"**
- Token expired or missing
- Log out and log in again

**"Network Error"**
- Backend is down
- CORS issue
- Check backend URL in .env

## ✅ Expected Behavior

### Successful Download:
1. Click download button
2. Button shows spinner (loading)
3. After 2-5 seconds, PDF downloads
4. Browser shows download notification
5. PDF file appears in Downloads folder
6. Success toast message appears

### Successful Preview:
1. Click view button
2. Navigate to preview page
3. PDF loads in iframe (2-5 seconds)
4. Can scroll through PDF
5. Action buttons work correctly

## 🎉 Success!

If everything works:
- ✅ Preview page loads correctly
- ✅ PDF displays in iframe
- ✅ Download button works
- ✅ New resumes download successfully
- ✅ All templates work
- ✅ Mobile responsive
- ✅ Error handling works

Your PDF download and preview system is now complete!
