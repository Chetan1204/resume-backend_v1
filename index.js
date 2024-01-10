const express = require('express')
const app = express()
const PORT = 4000
require('dotenv').config();
const manageRouter = require('./routes/manageRouter')
const expressLayouts = require('express-ejs-layouts')
const path = require('path')
const ejs = require('ejs');
const { Connectdb } = require('./config/dbConn')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const fs = require('fs')
const pageModel = require('./models/pageModel')
const { defaultPage } = require('./utils/constants')
const flash = require('connect-flash');
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const morgan = require("morgan");

/**
 * Connecting to database
 */
Connectdb();



app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(morgan(process.env.MODE === "development" ? 'dev' : 'combined'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret:process.env.SESSION_SECRET,
	resave:false,
	saveUninitialized:false,
	cookie:{
		maxAge:60*60000, // 1 hour
	},
	store:MongoStore.create({
		mongoUrl:"mongodb://127.0.0.1:27017/univbackend"
	})
}))
app.use(flash());
app.use(cors({
	origin:["http://192.168.16.36:5173"]
}))


// routes
app.get("/", (req, res)=>{
	console.log("rendering all pages...");
	res.redirect("/api/v1/manage/all-pages")
})
app.use('/api/v1/manage', manageRouter)

app.get('/newpage', (req, res) => {
	console.log("rendering new page...");
	res.render('newpage');
});
app.post('/create-page', async (req, res) => {
	console.log("creating a new page...");
	const { pageHeading, author } = req.body;
	const sanitizedPageName = pageHeading.replace(/\s/g, '-');
	const existingPage = await pageModel.findOne({ name: sanitizedPageName });
	if (existingPage) {
		req.flash("toast", "Page with the same name already exists")
		res.redirect("/api/v1/manage/all-pages");
	} else {
		const newPage = new pageModel({
			name: sanitizedPageName,
			author: author,
			sections: [{
				sectionName: "SEO",
				sectionSlug: "seo-section-slug",
				sectionContent: [
					{
						elementName: "input",
						elementClass: "form-control",
						elementLabelName: "Meta Title",
						elementAttrName: "elementMetaTitle",
						elementAttrId: "",
						elementAttrType: "text",
						elementAttrFor: "",
						elementValue: "",
					},
					{
						elementName: "input",
						elementClass: "form-control",
						elementLabelName: "Meta Description",
						elementAttrName: "elementMetaDescription",
						elementAttrId: "",
						elementAttrType: "text",
						elementAttrFor: "",
						elementValue: "",
					},
					{
						elementName: "input",
						elementClass: "form-control",
						elementLabelName: "Meta Keywords",
						elementAttrName: "elementMetaKeywords",
						elementAttrId: "",
						elementAttrType: "text",
						elementAttrFor: "",
						elementValue: "",
					}
				]
			}]
		});
		await newPage.save();

		// Generate a new EJS file for the page with the right sidebar code
		const directory = 'views/pages';
		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory);
		}

		const ejsContent = defaultPage(sanitizedPageName);


		const filePath = `${directory}/${sanitizedPageName}.ejs`;
		fs.writeFileSync(filePath, ejsContent);

		// Redirect to the newly created page
		res.redirect(`/page/${sanitizedPageName}`);
	}
});

app.get('/page/:pageName', async (req, res) => {
	console.log("rendering a page...");
	const { pageName } = req.params;
	try {
		const pageData = await pageModel.findOne({ name: pageName }).exec();

		if (!pageData) {
			res.send('Page not found!');
		} else {
			// Render the corresponding EJS file
			res.render(`pages/${pageName}`, { pageData });
		}
	} catch (err) {
		// Handle errors, log, or send an appropriate response
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

app.delete('/delete-page/:pageName', async (req, res) => {
	console.log("deleting a page...");
	const { pageName } = req.params;
	try {
		// Delete the page from the MongoDB collection
		await pageModel.deleteOne({ name: pageName });

		// Delete the corresponding EJS file from the 'views/pages' folder
		const filePath = `views/pages/${pageName}.ejs`;
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}

		res.sendStatus(200);
	} catch (error) {
		console.error('Error deleting page:', error);
		res.sendStatus(500);
	}
});


mongoose.connection.once("open", () => {
	console.log("connected to the Database")
	app.listen(PORT, () => {
		console.log(`[PORT ${PORT}] :: LIstening for connections...`)
	})
})
