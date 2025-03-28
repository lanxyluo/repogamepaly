const fs = require('fs');
const path = require('path');

// Add debug information
console.log('Current working directory:', process.cwd());
console.log('Directory contents:', fs.readdirSync(process.cwd()));

// Use process.cwd() instead of __dirname
const templatePath = path.join(process.cwd(), 'templates', 'game-template.html');
console.log('Template path:', templatePath);
console.log('Template exists:', fs.existsSync(templatePath));

// Also use process.cwd()
const configsDir = path.join(process.cwd(), 'game-configs');
console.log('Configs directory:', configsDir);
console.log('Configs directory exists:', fs.existsSync(configsDir));

try {
  // Ensure we can read the config directory
  const configFiles = fs.existsSync(configsDir) 
    ? fs.readdirSync(configsDir).filter(file => file.endsWith('.json'))
    : [];
  
  console.log('Found config files:', configFiles);

  // Exit early if template or config files are not found
  if (!fs.existsSync(templatePath)) {
    console.error('Error: Template file not found at', templatePath);
    return;
  }
  
  if (configFiles.length === 0) {
    console.error('Error: No JSON config files found in', configsDir);
    return;
  }

  // Read the template
  const template = fs.readFileSync(templatePath, 'utf8');
  console.log('Template loaded successfully');

  // Process each game configuration
  configFiles.forEach(configFile => {
    const configPath = path.join(configsDir, configFile);
    console.log('Processing config file:', configPath);
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('Config parsed successfully for game:', config.game_title);
    
    // Replace all placeholders
    let gameHtml = template;
    
    // Replace basic information
    gameHtml = gameHtml.replace(/{{GAME_TITLE}}/g, config.game_title || '');
    gameHtml = gameHtml.replace(/{{GAME_SHORT_DESCRIPTION}}/g, config.game_short_description || '');
    gameHtml = gameHtml.replace(/{{GAME_SLUG}}/g, config.game_slug || '');
    gameHtml = gameHtml.replace(/{{GAME_CATEGORY}}/g, config.game_category || '');
    gameHtml = gameHtml.replace(/{{GAME_CATEGORY_SLUG}}/g, config.game_category_slug || '');
    gameHtml = gameHtml.replace(/{{GAME_IFRAME_URL}}/g, config.game_iframe_url || '');
    gameHtml = gameHtml.replace(/{{GAME_DESCRIPTION_PARAGRAPH_1}}/g, config.game_description_paragraph_1 || '');
    gameHtml = gameHtml.replace(/{{GAME_DESCRIPTION_PARAGRAPH_2}}/g, config.game_description_paragraph_2 || '');
    
    // Replace game features
    for (let i = 1; i <= 5; i++) {
      gameHtml = gameHtml.replace(`{{GAME_FEATURE_${i}}}`, config.hasOwnProperty(`game_feature_${i}`) ? config[`game_feature_${i}`] : '');
    }
    
    // Generate game controls HTML
    let controlsHtml = '';
    if (config.game_controls && config.game_controls.length > 0) {
      config.game_controls.forEach(control => {
        controlsHtml += `<li class="flex items-start">
            <span class="inline-block bg-gray-200 rounded px-2 py-1 text-xs font-bold mr-2">${control.key}</span>
            <span>${control.action}</span>
        </li>`;
      });
    }
    gameHtml = gameHtml.replace('{{GAME_CONTROLS_HTML}}', controlsHtml);
    
    // Generate game tips HTML
    let tipsHtml = '';
    if (config.game_tips && config.game_tips.length > 0) {
      config.game_tips.forEach(tip => {
        tipsHtml += `<li>${tip}</li>`;
      });
    }
    gameHtml = gameHtml.replace('{{GAME_TIPS_HTML}}', tipsHtml);
    
    // Generate related games HTML
    let relatedGamesHtml = '';
    if (config.related_games && config.related_games.length > 0) {
      config.related_games.forEach(game => {
        relatedGamesHtml += `
        <a href="/game/${game.slug}" class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div class="relative pb-[56.25%] bg-gray-200">
                <img src="/images/games/${game.slug}.jpg" alt="${game.title}" class="absolute top-0 left-0 w-full h-full object-cover">
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg mb-1">${game.title}</h3>
                <p class="text-gray-600 text-sm">${game.category}</p>
            </div>
        </a>`;
      });
    }
    gameHtml = gameHtml.replace('{{RELATED_GAMES_HTML}}', relatedGamesHtml);
    
    // Write the generated game page
    const outputDir = path.join(process.cwd(), 'games');
    console.log('Output directory:', outputDir);
    
    // Ensure output directory exists
    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log('Created output directory:', outputDir);
      }
    } catch (err) {
      console.error('Error creating output directory:', err);
    }
    
    const outputPath = path.join(outputDir, `${config.game_slug}.html`);
    console.log('Writing file to:', outputPath);
    
    try {
      fs.writeFileSync(outputPath, gameHtml);
      console.log(`Generated page for: ${config.game_title}`);
    } catch (err) {
      console.error(`Error writing file for ${config.game_title}:`, err);
    }
  });
  
  console.log('All game pages generated successfully!');
  
  // Check generated files
  const outputDir = path.join(process.cwd(), 'games');
  if (fs.existsSync(outputDir)) {
    console.log('Generated files:', fs.readdirSync(outputDir));
  }
} catch (err) {
  console.error('Unexpected error in script:', err);
}
