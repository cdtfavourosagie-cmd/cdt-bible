# CDT Bible: how to put it online (Firebase version, plain English)
Vercel is the building that shows your website. Firebase is the filing cabinet that keeps each person's account, highlights and notes.
1. Go to console.firebase.google.com, sign in with Google, click Add project, name it cdt-bible, turn Google Analytics off, Create.
2. Left menu: Build → Authentication → Get started → Sign-in method → Email/Password → switch Enable on → Save.
3. Left menu: Build → Firestore Database → Create database → Start in production mode → pick the closest location → Enable.
4. In Firestore, open the Rules tab. Delete what is there, paste everything from the file firestore.rules (open it in Notepad), click Publish.
5. Click the gear icon → Project settings → scroll to Your apps → click the web icon </> → nickname cdt-bible → Register app (skip hosting). Copy the four values shown (apiKey, authDomain, projectId, appId).
6. Open config.js in Notepad, replace the four YOUR_ values with those, keep the quote marks, save.
7. github.com: new repository cdt-bible, upload every file and the data folder, Commit.
8. vercel.com: sign in with GitHub, Add New → Project, pick cdt-bible, Deploy. You get a live address.
9. Back in Firebase: Authentication → Settings → Authorized domains → Add domain → paste your live address without https:// (e.g. cdt-bible.vercel.app). Without this, sign-in will not work.
10. Open your live address, create an account, save a note, then sign in on your phone to check it appears.
Texts are public domain. Do not add copyrighted translations without a licence.
