# Vercel Deployment Guide - Next.js Frontend

## ✅ **Ready to Deploy!**

Your Next.js app is configured for Vercel deployment.

---

## 🚀 **DEPLOYMENT STEPS**

### **Method A: Vercel Dashboard** (Recommended - 5 min)

1. **Go to:** https://vercel.com/new

2. **Import Repository:**
   - Connect GitHub/GitLab/Bitbucket
   - OR: Upload folder directly (drag & drop)

3. **Configure Project:**
   ```
   Framework Preset: Next.js (auto-detected)
   Root Directory: next-app
   Build Command: npm run build (auto-detected)
   Output Directory: .next (auto-detected)
   Install Command: npm install (auto-detected)
   Node.js Version: 18.x or 20.x
   ```

4. **Environment Variables:**
   
   Click "Environment Variables" and add:
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_WP_URL` | `https://staging.cheapalarms.com.au/wp-json` |
   | `NEXT_PUBLIC_GHL_LOCATION_ID` | `aLTXtdwNknfmEFo3WBIX` |
   | `NODE_ENV` | `production` |

5. **Click: Deploy**

6. **Wait:** 3-5 minutes for build

7. **Success!** You'll get a URL like:
   ```
   https://headless-cheapalarms.vercel.app
   ```

---

### **Method B: Vercel CLI** (Advanced)

```bash
cd next-app

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts
```

---

## ✅ **After Deployment**

### **Step 1: Get Your Vercel URL**

Vercel will give you a URL like:
```
https://headless-cheapalarms-abc123.vercel.app
```

Or if you set custom domain:
```
https://portal.cheapalarms.com
```

---

### **Step 2: Update Backend CORS**

**Edit on Plesk:**
```
File Manager → /httpdocs/wp-content/plugins/cheapalarms-plugin/config/secrets.php
```

**Add your Vercel URL to both arrays (lines 21 and 37):**

```php
'upload_allowed_origins' => [
    'https://cheapalarms.com.au',
    'https://staging.cheapalarms.com.au',
    'https://headless-cheapalarms-abc123.vercel.app',  // ← ADD THIS
    'http://localhost',
    'http://localhost:3000',
],

'api_allowed_origins' => [
    'https://cheapalarms.com.au',
    'https://staging.cheapalarms.com.au',
    'https://headless-cheapalarms-abc123.vercel.app',  // ← ADD THIS
    'http://localhost:3000',
],
```

**Save the file.**

---

## 🧪 **Testing**

### **Test 1: Homepage**
```
Visit: https://your-vercel-url.vercel.app
```
Should show CheapAlarms homepage ✅

### **Test 2: Admin Login**
```
Visit: https://your-vercel-url.vercel.app/admin
Should redirect to: /login
```

Try logging in with WordPress admin credentials ✅

### **Test 3: Customer Portal**
```
Visit: https://your-vercel-url.vercel.app/portal?invite_token=test
```
Should show portal or expired token message ✅

### **Test 4: API Connection**
- Open browser console (F12)
- Try logging in
- Check Network tab
- Should see requests to: `staging.cheapalarms.com.au/wp-json/`
- Should get responses (not CORS errors) ✅

---

## 🔧 **Custom Domain** (Optional)

**After initial deployment:**

1. **Vercel Dashboard → Your Project → Settings → Domains**

2. **Add Domain:**
   ```
   portal.cheapalarms.com
   ```

3. **Update DNS:**
   ```
   Type: CNAME
   Name: portal
   Value: cname.vercel-dns.com
   ```

4. **Wait:** 5-60 min for DNS propagation

5. **Vercel auto-configures SSL**

---

## ✅ **Deployment Checklist**

- [ ] `.env.production` created with WordPress URL
- [ ] Code committed to Git (if using Git deploy)
- [ ] Project deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Build successful
- [ ] Deployment live
- [ ] Vercel URL obtained
- [ ] Backend CORS updated with Vercel URL
- [ ] Login tested
- [ ] Portal tested
- [ ] No CORS errors in console

---

## 🎉 **Success Criteria**

**Deployment successful when:**
- ✅ Can access Vercel URL
- ✅ Homepage loads
- ✅ Admin login works
- ✅ Portal displays data from WordPress
- ✅ No CORS errors
- ✅ Photos can upload

---

## 📝 **Post-Deployment**

**After everything works:**

1. Update `secrets.php` with production URL
2. Test complete workflow end-to-end
3. Monitor Vercel logs for errors
4. Set up custom domain (optional)
5. Configure monitoring/analytics

---

**Ready to deploy! Environment file is configured!** 🚀

**Next: Push to Git or upload to Vercel!**

