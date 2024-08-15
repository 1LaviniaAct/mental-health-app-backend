const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Result = require("./models/ResultSchema");
const Recommendation = require("./models/RecommendationSchema");
const Profile = require("./models/ProfileSchema");

const app = express();
const port = 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb://lavinia-app:passmongo@127.0.0.1:27017/lavinia-app-db', {
    useNewUrlParser: true
});

const UserSchema = new mongoose.Schema({
    email: String, 
    password: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' } 
});

const User = mongoose.model('User', UserSchema);

// Autentificare
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const newUser = new User({ email, password });
        await newUser.save();
        res.status(200).json({ message: 'User registered.', user: { email: newUser.email, role: newUser.role } });
    } catch (err) {
        console.error('Error registering new user:', err);
        res.status(500).send('Error registering new user.');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });
        if (user) {
            res.status(200).json({ userId: user._id, email: user.email, role: user.role });
        } else {
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error logging in.' });
    }
});

app.get('/getUserRole', async (req, res) => {
    const userId = req.query.userId;

    try {
        const user = await User.findById(_id);
        if (user) {
            res.json({ role: user.role });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});


// Middleware pentru verificarea rolului admin
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next(); // Continuă cu următoarea rută dacă utilizatorul este admin
    } else {
        res.status(403).send('Access denied. Only admins allowed.');
    }
}


//results

app.post('/saveResults', async (req, res) => {
    const { punctajStima, punctajDeznadejde, punctajEmotivitate, userId } = req.body;

    const newResult = new Result({
        punctajStima,
        punctajDeznadejde,
        punctajEmotivitate,
        userId,
        data: new Date() 
    });

    try {
        await newResult.save();
        res.status(200).send('Success');
    } catch (error) {
        res.status(500).send('Failed to save data');
    }
});

// Ruta pentru obținerea rezultatelor
app.get('/getResults', async (req, res) => {
    const userId = req.query.userId;

    try {
        const results = await Result.findOne({ userId });
        if (results) {
            res.json(results);
        } else {
            res.status(404).send('Results not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

app.get('/getAllResults', async (req, res) => {
    try {
        const results = await Result.find();
        if (results.length > 0) {
            res.json({ results: results }); 
        } else {
            res.status(404).send('No results found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});



//recomandations
// Adaugă o recomandare
app.post('/addRecommendation', async (req, res) => {
    const { category, categoryRosenberg, categoryStima, categoryDeznadejde, categoryEmotivitate, name, description, image } = req.body;

    const newRecommendation = new Recommendation({
        category,
        categoryRosenberg,
        categoryStima,
        categoryDeznadejde,
        categoryEmotivitate,
        name,
        description,
        image
    });

    try {
        await newRecommendation.save();
        res.status(200).send('Recomandare adăugată cu succes.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Eroare la adăugarea recomandării.');
    }
});

// Obține toate recomandările
app.get('/getRecommendations', async (req, res) => {
    try {
        const recommendations = await Recommendation.find();
        res.json(recommendations);
    } catch (error) {
        console.error(error);
        res.status(500).send('Eroare la obținerea recomandărilor.');
    }
});


// Obține recomandările pentru o anumită categorie
app.get('/getRecommendationsByCategory', async (req, res) => {
    const category = req.query.category;

    try {
        const recommendations = await Recommendation.find({ category });
        res.json(recommendations);
    } catch (error) {
        console.error(error);
        res.status(500).send('Eroare la obținerea recomandărilor.');
    }
});

// New endpoint to get recommendations for a user based on their results
// app.get('/getAllRecommendationsForUser', async (req, res) => {
//     const userId = req.query.userId;

//     try {
//         const result = await Result.findOne({ userId });

//         if (!result) {
//             return res.status(404).send('Results not found');
//         }

//         // Evaluate scores based on the Rosenberg scale
//         let categoryRosenberg = '';
//         if (result.punctajStima <= 20) {
//             categoryRosenberg = 'low';
//         } else if (result.punctajStima <= 30) {
//             categoryRosenberg = 'medium';
//         } else {
//             categoryRosenberg = 'high';
//         }

//         const recommendations = await Recommendation.find({ categoryRosenberg});

//         res.json({ recommendations });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal server error');
//     }
// });

app.get('/getAllRecommendationsForUser', async (req, res) => {
    const userId = req.query.userId;

    try {
        const result = await Result.findOne({ userId });

        if (!result) {
            return res.status(404).send('Results not found');
        }

        // Evaluate scores based on the Rosenberg scale
        let categoryStima = '';
        if (result.punctajStima <= 20) {
            categoryStima = 'low';
        } else if (result.punctajStima <= 30) {
            categoryStima = 'medium';
        } else {
            categoryStima = 'high';
        }

        let categoryDeznadejde = '';
        if (result.punctajDeznadejde <= 8) {
            categoryDeznadejde = 'low';
        } else if (result.punctajDeznadejde <= 14) {
            categoryDeznadejde = 'medium';
        } else {
            categoryDeznadejde = 'high';
        }

        let categoryEmotivitate = '';
        if (result.punctajEmotivitate <= 7) {
            categoryEmotivitate = 'low';
        } else if (result.punctajEmotivitate <= 16) {
            categoryEmotivitate = 'medium';
        } else {
            categoryEmotivitate = 'high';
        }

        // Log the evaluated categories
        console.log('Evaluated categories:', {
            categoryStima,
            categoryDeznadejde,
            categoryEmotivitate
        });

        // Find recommendations based on the categories
        const recommendations = await Recommendation.find({
            $or: [
                { categoryStima: categoryStima },
                { categoryDeznadejde: categoryDeznadejde },
                { categoryEmotivitate: categoryEmotivitate }
            ]
        });

        // Log the query and the resulting recommendations
        console.log('Query:', {
            $or: [
                { categoryStima: categoryStima },
                { categoryDeznadejde: categoryDeznadejde },
                { categoryEmotivitate: categoryEmotivitate }
            ]
        });
        console.log('Recommendations:', recommendations);

        res.json({ recommendations });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});




//Profile
app.get('/getProfileResults', async (req, res) => {
    const userId = req.query.userId;
    try {
        const profile = await Profile.findOne({ userId });
        if (profile) {
            res.json(profile);
        } else {
            res.status(404).send('Profile not found');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/saveProfileDetails', async (req, res) => {
    const { userId, name, position, description, punctajStima, punctajDeznadejde, punctajEmotivitate } = req.body;
    try {
        let profile = await Profile.findOne({ userId });
        if (profile) {
            profile.name = name;
            profile.position = position;
            profile.description = description;
            profile.punctajStima = punctajStima;
            profile.punctajDeznadejde = punctajDeznadejde;
            profile.punctajEmotivitate = punctajEmotivitate;
        } else {
            profile = new Profile({ userId, name, position, description, punctajStima, punctajDeznadejde, punctajEmotivitate });
        }
        await profile.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
