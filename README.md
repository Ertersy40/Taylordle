# Taylordle.xyz

Welcome to the Taylordle.xyz repository! This README will guide you through the structure of the project and provide information on the location and purpose of each file and directory. Apologies if the code's a bit messy, I built it in a day.

## Table of Contents

1. [Project Overview](#project-overview)
2. [File Descriptions](#file-descriptions)
3. [Scripts and Styles](#scripts-and-styles)
4. [Fonts](#fonts)
5. [Contact and Legal Pages](#contact-and-legal-pages)

## Project Overview

Taylordle is a Wordle-inspired game themed around Taylor Swift. This repository contains all the necessary files to run and maintain the website. The website includes the game logic, user interface, styling, and additional pages for contact, FAQ, and privacy policy.

## File Descriptions

### Root Directory Files

- **ads.txt**: Contains ads-related information for google adsense to validate the page.
- **CNAME**: Used for domain mapping.
- **songs.json**: JSON file containing normal mode song data.
- **hardSongs.json**: JSON file containing hard mode song data.
- **index.html**: The main HTML file for the website.
- **sitemap.xml**: Sitemap for SEO purposes.
- **tswizzle.ico**: Favicon for the website.

### .vscode Directory

- **settings.json**: VS Code settings specific to this project.

### contact-us Directory

- **contact.css**: Styling for the contact page.
- **contact.js**: JavaScript for the contact page.
- **index.html**: HTML file for the contact page.

### faq Directory

- **faq.css**: Styling for the FAQ page.
- **index.html**: HTML file for the FAQ page.

### fonts Directory

Contains all the font files used in the website:
- **BirdsofParadise.woff**
- **BirdsofParadise.woff2**
- **LouisGeorgeCafe.woff**
- **LouisGeorgeCafe.woff2**
- **TaylorSwiftHandwriting.woff**
- **TaylorSwiftHandwriting.woff2**

### privacy-policy Directory

- **index.html**: HTML file for the privacy policy page. Styling and js is not necessary

### scripts Directory

Contains all the JavaScript files used in the main game:
- **cookies.js**: Manages cookie consent. Temporarily disabled.
- **gameLogic.js**: Contains the core game logic.
- **initialisation.js**: Handles the initialization of the game. Includes event listeners
- **modals.js**: Manages the display of modals.
- **settingsSwitches.js**: Handles the settings toggles. (Hard mode and arrow direction)
- **sharing.js**: Manages the sharing functionality. (Sharing to socials/copying to clipboards)

### styling Directory

Contains all the CSS files used for styling the website:
- **ads.css**: Styling for advertisements.
- **animations.css**: Contains animation keyframes.
- **fonts.css**: Font defining and setting.
- **globals.css**: Global selector styles for the website.
- **modals.css**: Styling for modals.
- **style.css**: Main stylesheet for the website.

## Scripts and Styles

All JavaScript files are located in the `scripts` directory and all CSS files are in the `styling` directory. Each script and style file is modular and handles specific aspects of the website in an attempt to keep the code organized and maintainable.

## Fonts

Custom fonts used in the website are stored in the `fonts` directory. This includes various font files in both `.woff` and `.woff2` formats.

## Contact and Legal Pages

The `contact-us` directory contains files related to the contact page, and the `privacy-policy` directory contains the privacy policy page. They are in directories so the url shows /contact-us instead of /contact-us/index.html.

---