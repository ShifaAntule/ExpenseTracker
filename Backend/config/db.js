mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(`✅ Connected to MongoDB: ${process.env.MONGO_URI}`);
}).catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
});
