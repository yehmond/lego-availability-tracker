# 🧱 Lego Availability Tracker 

## Description

Simple tracker used to check if a LEGO product is available from the official LEGO website.
It will send an email to notify the recipient if the product is:
 - **In stock** ✅
 - **Retiring soon** ⚠️
 - **Retired** 💩

Intended to be used as a cron job. Must use your own email.

## Getting Started

- Change the variable `ids` to the array of LEGO ID's that you want to check  
- Change the environment variables for EMAIL and PWRD

## Built With

- axios
- cheerio
- nodemailer
