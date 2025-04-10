# Google Sheets API Guide

## Language
- [Read this in Persian](./README_FA.me)

## English

### Step 1: Create a Project in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in with your Google account.
3. Click on your project in the top bar or create a new project if you don't have one.
4. To create a new project, click on "Select a Project" and then choose "New Project".
5. Enter your project name and click "Create".

### Step 2: Enable Google Sheets API

1. In your project dashboard, go to the "Library" or "API & Services" section.
2. Search for "Google Sheets API".
3. Click on "Google Sheets API" and then click "Enable".

### Step 3: Create Credentials

1. Go to the "Credentials" section in the sidebar.
2. Click on "Create Credentials" and select "Service account".
3. Fill in the necessary details to create the service account. Enter a service account name and optional description.
4. Click "Create and Continue".
5. Assign roles to the service account (e.g., "Editor" for editing sheets).
6. Click "Done".

### Step 4: Create a Private Key for the Service Account

1. Return to the "Credentials" page and find your service account.
2. Click the pencil icon next to the service account to edit it.
3. Go to the "Keys" tab.
4. Click "Add Key" and select "JSON".
5. A private key will be downloaded as a JSON file. Keep this file in a safe place.

### Step 5: Share Google Sheet with the Service Account

1. Go to your desired Google Sheet.
2. Click on the "Share" button.
3. Enter the service account email address and grant the required access (e.g., "Editor").
4. Click "Send".

### Step 6: Use Google Sheets API in Your Application

Now you can use the Google Sheets API in your application with various libraries available for different languages.

### How to Find Your Google Sheet ID

- Open your Google Sheet in a browser.
- Look at the URL in the address bar. It will look something like this:

https://docs.google.com/spreadsheets/d/1vqshz1A5245234ASGDAERTQW34T53WGTQWERT45Tl-w/edit

- The part between `/d/` and `/edit` is your Sheet ID:
1vqshz1A5245234ASGDAERTQW34T53WGTQWERT45Tl-w




npm create vite@latest karen --template react
cd karen
npm install
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom


npm install @react-oauth/google
npm install gapi-script

npm install @mui/material @emotion/react @emotion/styled @mui/icons-material react-swipeable framer-motion









به Google Cloud Console بروید: https://console.cloud.google.com/
پروژه مربوطه (words-456103) را انتخاب کنید.
به بخش APIs & Services -> OAuth consent screen بروید. (از منوی سمت چپ)
مطمئن شوید که Publishing status روی "Testing" تنظیم شده باشد. (اگر روی "In production" باشه و تأیید نشده باشید، هیچ کاربری نمی‌تونه وارد بشه مگر اینکه تأیید کامل رو انجام بدید).
در قسمت "Test users"، روی دکمه "ADD USERS" کلیک کنید.
آدرس ایمیل گوگل خودتون (workhamidi.110@gmail.com) و هر ایمیل دیگه‌ای که می‌خواید در حین تست بتونه از برنامه استفاده کنه رو وارد کنید.
روی "SAVE" کلیک کنید.
بعد از انجام این مراحل:
audiance 




npm install node-fetch jsdom