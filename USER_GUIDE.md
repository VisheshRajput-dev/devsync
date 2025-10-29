# Devsync User Guide

Welcome to Devsync! This guide will help you get started and make the most of all features.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating and Joining Rooms](#creating-and-joining-rooms)
3. [Using the Code Editor](#using-the-code-editor)
4. [File Management](#file-management)
5. [Code Execution](#code-execution)
6. [Collaboration Features](#collaboration-features)
7. [Chat System](#chat-system)
8. [Session Management](#session-management)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### First Time Setup

1. **Access Devsync**: Navigate to the Devsync URL (provided by your administrator)
2. **Enter Username**: When joining a room, enter your username or continue as guest
3. **Start Coding**: Once in a room, you can start coding immediately!

### Interface Overview

- **Top Bar**: Room controls, save/load buttons, format button
- **File Tabs**: Manage multiple files, upload, download, search
- **Code Editor**: Main editing area with syntax highlighting
- **Output Panel**: View code execution results
- **Chat Panel**: Communicate with team members
- **User List**: See who's online in the room

## Creating and Joining Rooms

### Creating a New Room

1. Click **"Create New Room"** on the home page
2. Enter your username (or skip for guest)
3. You'll be redirected to your new room
4. Copy the room link from the top bar to share with others

### Joining an Existing Room

#### Method 1: Using Room Link
1. Click the shared room link
2. You'll be automatically redirected to the room

#### Method 2: Using Room ID
1. Click **"Join Room"** on the home page
2. Paste or enter the room ID
3. Enter your username
4. Click **"Join"**

### Room Features

- **Unique URLs**: Each room has a unique URL/ID
- **Multi-user**: Unlimited users per room
- **Persistence**: Rooms can be saved and restored (if Firebase is configured)
- **Real-time Sync**: All changes sync instantly

## Using the Code Editor

### Basic Editing

- **Type to code**: Start typing in the editor - changes sync automatically
- **Syntax Highlighting**: Automatic based on file language
- **IntelliSense**: Code completion and suggestions (Monaco Editor)
- **Line Numbers**: Toggle line numbers in editor settings

### Code Formatting

1. Click the **"Format"** button in the top bar
2. Or use keyboard shortcut: `Shift + Alt + F` (Windows) or `Shift + Option + F` (Mac)
3. Code will be automatically formatted according to language rules

### Finding and Replacing

- **Find**: Press `Ctrl + F` (Windows/Linux) or `Cmd + F` (Mac)
- **Replace**: Press `Ctrl + H` (Windows/Linux) or `Cmd + Option + F` (Mac)
- **Find in Files**: Use the search button in file tabs

### Error Detection

- **Syntax Errors**: Shown in red underlines
- **Warnings**: Shown in yellow underlines
- **Error Panel**: Click the error panel at the bottom to see all errors
- **Navigate to Error**: Click on an error in the panel to jump to that line

### Supported Languages

Devsync supports syntax highlighting for:
- JavaScript, TypeScript, JSX, TSX
- Python, Java, C, C++, C#
- HTML, CSS, SCSS, SASS
- JSON, XML, YAML
- Markdown, SQL
- Shell scripts (Bash, Zsh, PowerShell)
- Go, Rust, Ruby, PHP
- And more!

## File Management

### Creating Files

1. Click **"New File"** button in the file tabs
2. Select file type from dropdown:
   - JavaScript
   - TypeScript
   - Python
   - HTML
   - CSS
   - And more...
3. Enter file name (extension will be added automatically if missing)
4. File will be created and opened for editing

### Uploading Files

1. Click **"Upload"** button in file tabs
2. Select one or more files from your computer
3. Files will be:
   - Validated (name, size, content)
   - Auto-detected for language
   - Added to the current room
   - Synced to all users

**Supported File Types:**
- Code files: `.js`, `.ts`, `.py`, `.java`, `.cpp`, etc.
- Web files: `.html`, `.css`, `.json`
- Text files: `.txt`, `.md`
- Configuration: `.xml`, `.yaml`, `.yml`

**Limits:**
- Maximum file size: 5MB per file
- Maximum file name length: 255 characters
- Invalid characters are not allowed

### Downloading Files

#### Download Single File
1. Hover over a file tab
2. Click the download icon (arrow down)
3. File will download to your computer

#### Download All Files
1. Click **"Download All"** button in file tabs
2. All files will be packaged as a ZIP file
3. ZIP file name: `devsync-{roomId}-{timestamp}.zip`

### Searching Files

1. Click the **search icon** in file tabs
2. Type to filter files by:
   - File name
   - Language
   - File content
3. Results update in real-time
4. Click search icon again to close

### Renaming Files

1. Hover over a file tab
2. Click the edit icon (pencil)
3. Type new name (extension cannot be changed)
4. Press Enter or click outside to save

### Deleting Files

1. Hover over a file tab
2. Click the delete icon (X) - only visible if there are multiple files
3. File will be deleted for all users
4. **Note**: You cannot delete the last remaining file

## Code Execution

### Running Code

1. Open a file with supported language:
   - JavaScript
   - TypeScript
   - Python
   - HTML
   - CSS
2. Click the **"Run"** button in the output panel
3. View results in the output panel

### Supported Languages for Execution

#### JavaScript/TypeScript
- Native browser execution
- Full console support
- DOM manipulation available

#### Python
- Powered by Pyodide
- Browser-based Python runtime
- Standard library support
- May take a moment to load on first run

#### HTML/CSS
- Live rendering in output panel
- Interactive elements work
- External resources may be limited

### Output Panel

- **Console Output**: See `console.log()` messages
- **Errors**: View execution errors and stack traces
- **Execution Time**: See how long code took to run
- **Clear**: Click clear button to clear output

### Execution Limits

- **Timeout**: 5 seconds default timeout
- **Console**: Limited console output
- **Security**: Sandboxed execution for safety

## Collaboration Features

### Real-time Sync

- **Instant Updates**: Changes sync to all users in < 100ms
- **Cursor Position**: See where others are typing
- **File Changes**: All file operations sync in real-time
- **No Conflicts**: Automatic conflict resolution

### User Presence

- **Online Users**: See all users currently in the room
- **User Avatars**: Color-coded avatars for easy identification
- **Join/Leave**: Get notified when users join or leave

### Best Practices

1. **Communication**: Use chat to coordinate changes
2. **File Names**: Use descriptive file names
3. **Code Style**: Follow consistent coding style
4. **Save Often**: Use save session feature regularly

## Chat System

### Sending Messages

1. Type message in chat input at bottom
2. Press Enter or click Send
3. Message appears instantly for all users

### Chat Features

- **Real-time**: Messages appear instantly
- **Persistent**: Messages saved in session
- **Rate Limited**: 10 messages per minute per user
- **History**: Chat history loads with saved sessions

### Chat Etiquette

- Be respectful and professional
- Use chat to coordinate coding
- Keep messages concise
- Don't spam messages

## Session Management

### Saving Sessions

1. Click **"Save Session"** button in top bar
2. Session is saved to Firebase (if configured)
3. All data saved:
   - All files and their content
   - Chat messages
   - User list
   - Active file

### Loading Sessions

1. Click **"Load Session"** button in top bar
2. Saved session will be restored
3. All files and messages will load

### Session Data

**What's Saved:**
- ✓ All file contents
- ✓ File names and languages
- ✓ Chat messages
- ✓ User list
- ✓ Active file

**What's NOT Saved:**
- ✗ Output panel results
- ✗ Unsaved editor changes (if not saved)
- ✗ Temporary state

### Firebase Setup

For session persistence, Firebase must be configured:
1. Contact administrator for Firebase setup
2. Or see README.md for self-hosting instructions

## Keyboard Shortcuts

### Editor Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + F` | Find |
| `Ctrl/Cmd + H` | Find and Replace |
| `Shift + Alt + F` | Format Code |
| `Ctrl/Cmd + S` | (Manual save - see save button) |
| `Ctrl/Cmd + /` | Toggle comment |

### Monaco Editor Shortcuts

All standard VS Code shortcuts work:
- `Ctrl/Cmd + D`: Select word
- `Alt + Click`: Add cursor
- `Ctrl/Cmd + Click`: Go to definition
- And many more!

### Navigation

- Click file tabs to switch files
- Use arrow keys in editor
- Scroll with mouse wheel or trackpad

## Troubleshooting

### Common Issues

#### Changes Not Syncing

**Solution:**
- Check internet connection
- Refresh the page
- Check that backend server is running
- Look for errors in browser console

#### Code Not Executing

**Solution:**
- Verify language is supported for execution
- Check for syntax errors
- Try simpler code first
- Check output panel for error messages

#### Files Not Uploading

**Solution:**
- Check file size (max 5MB)
- Verify file name is valid
- Check file extension is supported
- Look for error messages

#### Socket Connection Failed

**Solution:**
- Verify backend is running
- Check `VITE_SOCKET_URL` environment variable
- Check firewall settings
- Try refreshing the page

#### Session Not Saving

**Solution:**
- Verify Firebase is configured
- Check browser console for errors
- Ensure you have internet connection
- Try again after a moment

### Performance Tips

1. **Large Files**: Avoid very large files (> 1MB)
2. **Many Files**: Limit to < 50 files per session
3. **Browser**: Use modern browsers (Chrome, Firefox, Edge)
4. **Internet**: Stable connection recommended

### Getting Help

- Check browser console for errors
- Review this documentation
- Contact administrator
- Open GitHub issue (if self-hosted)

## Tips and Tricks

### Productivity Tips

1. **Use Search**: Quickly find files or code
2. **Keyboard Shortcuts**: Learn shortcuts for speed
3. **Format Code**: Keep code clean with formatting
4. **Save Regularly**: Don't lose work
5. **Chat Communication**: Coordinate with team

### Collaboration Tips

1. **Coordinate**: Use chat to plan changes
2. **File Organization**: Use clear file names
3. **Code Style**: Agree on coding standards
4. **Test Together**: Use output panel collaboratively
5. **Save Sessions**: Regular saves prevent data loss

---

**Happy Coding! 🚀**

For technical details, see [API Documentation](./API_DOCUMENTATION.md)
For setup instructions, see [README](./README.md)

