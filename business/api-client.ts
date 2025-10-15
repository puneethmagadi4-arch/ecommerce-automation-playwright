export default class ApiClient {  // Fixed: Ensure 'export default class'
  async getCartTotal(): Promise<number> {
    // Mock: No real API on demo site; return 0 for fallback to UI
    console.log('Mock API: No real API, using UI fallback');
    return 0;
  }
}