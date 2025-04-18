[Read this in English](./README.me)

### مرحله 1: ایجاد یک پروژه در Google Cloud Console

1. به [Google Cloud Console](https://console.cloud.google.com/) بروید.
2. وارد حساب Google خود شوید.
3. در نوار بالایی، بر روی پروژه خود کلیک کنید یا اگر پروژه‌ای ندارید، یک پروژه جدید ایجاد کنید.
4. برای ایجاد پروژه جدید، بر روی "Select a Project" کلیک کنید و سپس "New Project" را انتخاب کنید.
5. نام پروژه خود را وارد کرده و دکمه "Create" را فشار دهید.

### مرحله 2: فعال‌سازی Google Sheets API

1. در داشبورد پروژه خود، به قسمت "Library" یا "API & Services" بروید.
2. در بخش جستجو، "Google Sheets API" را تایپ کنید.
3. بر روی "Google Sheets API" کلیک کنید و سپس دکمه "Enable" را فشار دهید.

### مرحله 3: ایجاد اعتبار‌نامه‌ها (Credentials)

1. به قسمت "Credentials" در نوار کناری بروید.
2. بر روی "Create Credentials" کلیک کنید و سپس گزینه "Service account" را انتخاب کنید.
3. اطلاعات مورد نیاز برای ایجاد حساب سرویس را وارد کنید. نام حساب سرویس و توضیحات اختیاری را وارد کنید.
4. بر روی "Create and Continue" کلیک کنید.
5. نقش‌هایی که به حساب سرویس می‌دهید را انتخاب کنید (برای مثال، "Editor" برای ویرایش صفحات).
6. بر روی "Done" کلیک کنید.

### مرحله 4: ایجاد کلید خصوصی برای حساب سرویس

1. به صفحه "Credentials" بازگردید و حساب سرویس خود را پیدا کنید.
2. بر روی آیکون مداد کنار حساب سرویس کلیک کنید تا ویرایش شود.
3. به تب "Keys" بروید.
4. بر روی "Add Key" کلیک کرده و گزینه "JSON" را انتخاب کنید.
5. کلید خصوصی به صورت یک فایل JSON دانلود می‌شود. این فایل را در جای امنی نگه دارید.

### مرحله 5: اشتراک‌گذاری صفحه Google Sheet با حساب سرویس

1. به صفحه Google Sheet مورد نظر خود بروید.
2. بر روی دکمه "Share" کلیک کنید.
3. آدرس ایمیل حساب سرویس که ایجاد کرده‌اید را وارد کنید و دسترسی لازم (مانند "Editor") را بدهید.
4. بر روی "Send" کلیک کنید.

### مرحله 6: استفاده از Google Sheets API در برنامه

اکنون می‌توانید از Google Sheets API در برنامه خود استفاده کنید.

### چگونه شناسه Google Sheet خود را پیدا کنیم

- صفحه Google Sheet خود را در مرورگر باز کنید.
- به URL در نوار آدرس نگاه کنید. باید چیزی شبیه به این باشد:

https://docs.google.com/spreadsheets/d/1vqshz1A5245234ASGDAERTQW34T53WGTQWERT45Tl-w/edit

- بخش بین `/d/` و `/edit` شناسه شیت شماست:
1vqshz1A5245234ASGDAERTQW34T53WGTQWERT45Tl-w