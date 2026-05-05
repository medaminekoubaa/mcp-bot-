# 🔑 Add SSH Key to GitHub

## Your SSH Public Key (Ready to Copy)

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCtxh3ltD9DE/o3DcoiwQ8776ko5Pn/FiSxx2bUmBY6YgInAG9fKIYSxTwdC6gUX3Y/93gLsAKBQfy8JTvN5V76PWq2My5chs+2Ocj8G/dj7FQCHUCsSiHzxiXm8pmOen7D1NNA63O5+fl3buxrDttHqax58+qT1gaclIczGK6xsWOlHMvqYEHodVCWcUAWVxPcoMqxKYAJ9NSrfOz1Irv6rs3g+NIeHkPtYQWqk+NspiIpb5hdRPopvORNAG0hLkFV0Rcis5xbVA6Ng1rR0o/f+3qM8zISg1MM/7JnCCq9wgZWxLjLVZFgB4LAYlmjBuOxRK8qnak2lb4X2jRLE7bjrfncc9YkeppazMCLOAVSUobvccx7XbJb11qF40ETK6DeKjl3T+O3yErAT7XdNMk7UNLj8x0PXlVk2hfelOufDRSqq+1R8h2RfanMbr1kT5S7xaGSlE3z6vJBCkbjh4ORdXAkZJKZkvCQuqNeMIyXkEVev+R6ZY0TtPl/UEWlBKrAS4k+4zvYeJDC/gCdZA9up4Vif0hMtRWBlcYUuguEvOydxYQeQL0RCBUm7Stx7AdICzPL8kLOEGAf2q5FFHvlkFXIWB6M84/PG1GFMGkMLx3Jm7xxwB83zdrABEPlOoqgnUjlnE1sjYEPqpy29quh6osnWeB8hi70pyR9pgs55w== needaimdark@NeeDaimDarkLaptopMsi
```

## Steps to Add to GitHub

### 1️⃣ Go to GitHub Settings
```
https://github.com/settings/keys
(or Settings → SSH and GPG keys)
```

### 2️⃣ Click "New SSH Key"

### 3️⃣ Enter Details
- **Title:** `mcp-bot-deploy`
- **Key type:** Authentication Key
- **Key:** Copy entire SSH key above (starts with ssh-rsa, ends with the email)

### 4️⃣ Click "Add SSH Key"

### 5️⃣ Confirm Password
GitHub will ask for your password - enter it

---

## ✅ Done!

Once added, come back and run:
```bash
cd /home/needaimdark/Desktop/mcp-bot
bash setup-github.sh
```

Your code will automatically push to GitHub! 🚀

