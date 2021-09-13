## File Explorer Application

This application accepts the path of the directories you want to explore.

It's a node JS based application rendering the directory structure in browser in a React application.

## Features

- You can see the nested sturcture of your directories in browser in a tree form
- Every Addition, deletion, renaming or moving of files in the directories are reflected in the browser.
- Changes in nested directories are also updated in real time.

### Server

- NodeJs server
- Using Socket.io for communication with client
- Serves the client application at `https://localhost:8080/`

### Client

- React application
- Uses Tree component from Ant Design to render the directory structure
- Uses Socket-client.io for communication with server

## How to run the application

(You would need to have latest node and npm installed on you local machine)

- Clone this github repo
- Go to the root of the folder && Install the deps
  > `npm i`
- Build the client
  > `npm build:client`
- Start the server
  > `node file-explorer.js [your directory path]`
  
  Example usage: `node file-explorer.js ~/Desktop/ ./a/random-dir/`

## Future Improvements
- Add tests for both server and client
- Make UI better for the client with styling