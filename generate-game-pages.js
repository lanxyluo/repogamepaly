const fs = require('fs');
const path = require('path');

// Read the game template
const templatePath = path.join(__dirname, 'templates', 'game-template.html');
const template = fs.readFileSync(templatePath, 'utf8');

// Read all game configurations
const configsDir = path.join(__dirname, 'game-configs');
const configFiles = fs.readdirSync(configsDir).filter(file => file.endsWith('.json'));

// Process each game configuration
configFiles.forEach(configFile => {
  const configPath = path.join(configsDir, configFile);
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Replace all placeholders
  let gameHtml = template;
  
  // Replace basic information
  gameHtml = gameHtml.replace(/{{GAME_TITLE}}/g, config.game_title);
  gameHtml = gameHtml.replace(/{{GAME_SHORT_DESCRIPTION}}/g, config.game_short_description);
  gameHtml = gameHtml.replace(/{{GAME_SLUG}}/g, config.game_slug);
  gameHtml = gameHtml.replace(/{{GAME_CATEGORY}}/g, config.game_category);
  gameHtml = gameHtml.replace(/{{GAME_CATEGORY_SLUG}}/g, config.game_category_slug);
  gameHtml = gameHtml.replace(/{{GAME_IFRAME_URL}}/g, config.game_iframe_url);
  gameHtml = gameHtml.replace(/{{GAME_DESCRIPTION_PARAGRAPH_1}}/g, config.game_description_paragraph_1);
  gameHtml = gameHtml.replace(/{{GAME_DESCRIPTION_PARAGRAPH_2}}/g, config.game_description_paragraph_2);
  
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
  const outputDir = path.join(__dirname, 'games');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  const outputPath = path.join(outputDir, `${config.game_slug}.html`);
  fs.writeFileSync(outputPath, gameHtml);
  
  console.log(`Generated page for: ${config.game_title}`);
});

console.log('All game pages generated successfully!');
