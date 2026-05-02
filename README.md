🏨 Hostel Management System

Welcome to the Hostel Management System! This is a full-stack web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) and styled with TailwindCSS.

If you have downloaded this code and want to run it on your own computer, just follow these simple steps!

🛑 Prerequisites

Before you start, make sure you have the following installed on your computer:

Node.js: Download it from nodejs.org (Choose the LTS version).

VS Code: Or any other code editor you prefer.

🚀 How to Run the Project

You will need to open two separate terminals in your code editor. One terminal will run the backend (server), and the other will run the frontend (user interface).

Step 1: Set up the Backend (Database & Server)

Open the project folder in VS Code.

Open a terminal and go inside the backend folder:

cd backend


Install all the required backend packages:

npm install


CRUCIAL STEP: You need to connect your own database.

Inside the backend folder, create a new file and name it exactly .env

Open the .env file and paste the following, replacing the link with your actual MongoDB connection string:

PORT=5000
MONGO_URI=your_mongodb_connection_string_here


Start the backend server:

node server.js


(You should see a message saying "Successfully connected to MongoDB!" If you do, leave this terminal open and running!)

Step 2: Set up the Frontend (React UI)

Open a new, second terminal window in VS Code (keep the first one running).

Go inside the frontend folder:

cd frontend


Install all the required frontend packages:

npm install


Start the React frontend:

npm run dev

...............................................................................................................................................

                             use this Card Details only 
...............................................................................................................................................

To test the payment functionality, please use the following dummy credit card details. You can select either success or failure to see how the transaction appears in your PhonePe account:

- Card Number: 4242 4242 4242 4242
- Expiry Date: 12/44
- CVV: 936
- OTP: 123456

..............................................................................................................................................................................................................................................................................................

                                  admin ID and password 

     admin account is admin@gmail.com
     password admin


..............................................................................................................................................................................................................................................................................................
............................................................................................................................................................

                                  staff ID and password 

    staff account is staff@gmail.com
     password staff


...................................................................................................................................................................................................................................................................

It will give you a local link (usually http://localhost:5173). Ctrl + Click (or Cmd + Click) that link to open the app in your browser!

🛠️ Troubleshooting

Blank screen or "Cannot GET"? Make sure your .env file is inside the backend folder and contains the correct MongoDB connection link.

Network Error? Make sure you have BOTH terminals running at the same time. The frontend needs the backend to work!