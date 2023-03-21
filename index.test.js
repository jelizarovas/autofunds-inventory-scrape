const scrapeInventory = require('./scrapeInventory');

describe('scrapeInventory', () => {
  test('returns an array of inventory items', async () => {
    const inventory = await scrapeInventory();
    expect(Array.isArray(inventory)).toBe(true);
    expect(inventory.length).toBeGreaterThan(0);
    expect(typeof inventory[0]).toBe('object');
    expect(inventory[0]).toHaveProperty('modelYear');
    expect(inventory[0]).toHaveProperty('make');
    expect(inventory[0]).toHaveProperty('model');
    expect(inventory[0]).toHaveProperty('thumbnail');
    expect(inventory[0]).toHaveProperty('trim');
    expect(inventory[0]).toHaveProperty('url');
    expect(inventory[0]).toHaveProperty('vin');
  });

  test('logs how long it took to scrape inventory', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log');
    await scrapeInventory();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Scraping inventory took'));
  });
});