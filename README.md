# 🚀 NASA Asteroid & Exoplanet Explorer

A modern, interactive web application for exploring Near-Earth Objects (NEOs) and nearby exoplanetary systems using NASA's APIs. Built with a stunning glassmorphism UI and comprehensive data visualization.

![NASA Explorer](https://img.shields.io/badge/NASA-API-blue?style=for-the-badge&logo=nasa)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## ✨ Features

### 🌌 Asteroid Discovery
- **Search by Date Range**: Find asteroids approaching Earth within specific timeframes
- **Individual Lookup**: Get detailed information about specific asteroids by ID
- **Browse Database**: Explore the complete NASA NEO database with pagination
- **Hazard Assessment**: Visual indicators for potentially hazardous asteroids

### 🔬 JPL Small-Body Database Integration
- **Detailed Orbital Data**: Complete orbital elements and characteristics
- **Physical Properties**: Size, rotation period, albedo, density, and more
- **Interactive Modal**: Beautiful glassmorphism modal for detailed views
- **Smart Fallback**: Multiple search methods (SPK ID, designation, name search)

### 🪐 Exoplanet Exploration
- **Nearby Systems**: Discover exoplanetary systems within specified distances
- **Filter by Planets**: Find systems with minimum planet counts
- **Distance Conversion**: Automatic parsec to light-year conversion
- **System Details**: Host star information and planet discovery data

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful frosted glass effects throughout
- **Responsive Layout**: Perfect on desktop, tablet, and mobile devices
- **Smooth Animations**: Micro-interactions and transition effects
- **Dark Theme**: Space-appropriate color scheme with gradients

## 🚀 Quick Start

### Prerequisites
- Node.js (for local development server)
- NASA API Key (optional, defaults to DEMO_KEY)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nasa-explorer.git
   cd nasa-explorer
   ```

2. **Configure API Key** (Optional)
   
   Edit `config.js` and replace the API key:
   ```javascript
   window.APP_CONFIG = {
     NASA_API_KEY: 'your-nasa-api-key-here'
   };
   ```

3. **Start a local server**
   ```bash
   # Using Node.js http-server
   npx http-server

   # Or using Python
   python -m http.server 8000

   # Or using PHP
   php -S localhost:8000
   ```

4. **Open in browser**
   
   Navigate to `http://localhost:8000`

## 🛠️ API Configuration

### NASA APIs Used
- **NeoWs (Near Earth Object Web Service)**: Asteroid data
- **JPL Small-Body Database**: Detailed orbital and physical parameters
- **NASA Exoplanet Archive**: Exoplanet system data

### Serverless Deployment
The application includes serverless functions for API proxying:

- `api/neo.js`: Unified proxy for both NeoWs and JPL SBDB
- `api/exo.js`: Proxy for NASA Exoplanet Archive

Deploy to platforms like:
- Vercel
- Netlify Functions
- Cloudflare Workers

## 📱 Usage Guide

### Asteroid Search
1. **By Date Range**
   - Select start and end dates (max 7 days apart)
   - Click "Search Asteroids"
   - View results with approach data and hazard indicators

2. **Individual Lookup**
   - Enter asteroid SPK-ID (e.g., 3542519 for Eros)
   - Get comprehensive details including close approaches
   - Access JPL database details via modal

3. **Browse Database**
   - Explore paginated asteroid catalog
   - View basic properties and access detailed information

### JPL Details Modal
- Click "🔬 View JPL Details" on any asteroid
- View organized data in three categories:
  - **Basic Information**: Classification and magnitude
  - **Orbital Elements**: Complete orbital mechanics
  - **Physical Properties**: Size, rotation, composition

### Exoplanet Discovery
1. Set maximum distance in parsecs
2. Choose minimum number of planets per system
3. Explore nearby planetary systems with detailed information

## 🎨 Customization

### Styling
The application uses CSS custom properties for easy theming:

```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --glass-bg: rgba(255, 255, 255, 0.1);
    --glass-border: rgba(255, 255, 255, 0.2);
    /* ... more variables */
}
```

### Configuration
Modify `config.js` to customize:
- API endpoints
- Default search parameters
- Proxy configurations

## 🔧 Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **APIs**: NASA NeoWs, JPL SBDB, Exoplanet Archive
- **Styling**: Modern CSS with glassmorphism effects
- **Responsive**: Mobile-first design approach

### Browser Support
- Chrome 88+
- Firefox 87+
- Safari 14+
- Edge 88+

### Performance Features
- Lazy loading of data
- Efficient API caching
- Optimized animations
- Responsive image handling

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use ES6+ features
- Follow consistent naming conventions
- Add comments for complex logic
- Maintain responsive design principles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** for providing comprehensive APIs
- **JPL Small-Body Database** for detailed asteroid information
- **NASA Exoplanet Archive** for exoplanet system data
- **Inter Font Family** for beautiful typography

## 🚀 Future Enhancements

- [ ] 3D visualization of asteroid orbits
- [ ] Real-time tracking of approaching asteroids
- [ ] Comparison tools for multiple objects
- [ ] Export functionality for data
- [ ] Advanced filtering options
- [ ] Offline capability with service workers

---

**Made with ❤️ for space exploration enthusiasts**

*Explore the cosmos from your browser!* 🌌
