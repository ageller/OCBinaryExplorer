following tutorials here : 
- https://nextjs.org/learn/foundations/from-react-to-nextjs/getting-started-with-nextjs
- https://www.geeksforgeeks.org/how-to-connect-reactjs-with-flask-api/
- https://blog.logrocket.com/deploying-next-js-flask/
- and also thanks to chatGPT for helping me debug!  (using 127.0.0.1 instead of localhost)

may be useful later
- https://alexanderhupfer.medium.com/how-to-deploy-next-js-with-flask-the-easy-way-9025a61c8765
- https://dev.to/andrewbaisden/how-to-deploy-a-python-flask-app-to-vercel-2o5k
- https://vercel.com/templates/python/flask-hello-world

Connecting the next.js frontend to the flask backend requires modification of the ```frontend/next.config.js``` file to add all the api endpoint.  See that file for details.

Then to start the backend and frontend:

```
# on WSL

# terminal 1
cd backend/
python server.py

# terminal 2
cd frontend/
npm run dev
```


