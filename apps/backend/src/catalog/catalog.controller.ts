import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Header, UseInterceptors, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { WebpConversionInterceptor } from '../common/interceptors/webp-conversion.interceptor';
import { AdminApiKeyGuard } from '../common/guards/api-key.guard';
import { ImageOptimizerService } from '../common/services/image-optimizer.service';

@Controller('catalog')
@UseInterceptors(WebpConversionInterceptor)
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly imageOptimizer: ImageOptimizerService,
  ) {}

  // High Performance WebP Image Upload & Storage Endpoint
  @Post('upload-image')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async uploadImage(@Body() body: { image: string; folder?: string }) {
    if (!body || !body.image) {
      return { success: false, message: 'Image data is required' };
    }
    const folder = body.folder || 'products';
    const url = await this.imageOptimizer.saveBase64ToStorage(body.image, folder);
    return { success: true, url, folder };
  }

  @Post('upload-images')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async uploadImages(@Body() body: { images: string[]; folder?: string }) {
    if (!body || !Array.isArray(body.images)) {
      return { success: false, message: 'Images array is required', urls: [] };
    }
    const folder = body.folder || 'products';
    const urls = await Promise.all(
      body.images.map(img => this.imageOptimizer.saveBase64ToStorage(img, folder))
    );
    return { success: true, urls, folder };
  }

  // Categories
  @Get('categories')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getCategories() {
    return this.catalogService.getCategories();
  }

  @Post('categories')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveCategory(@Body() body: any) {
    return this.catalogService.saveCategory(body);
  }

  @Delete('categories/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deleteCategory(@Param('id') id: string) {
    return this.catalogService.deleteCategory(id);
  }

  // Brands
  @Get('brands')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getBrands() {
    return this.catalogService.getBrands();
  }

  @Post('brands')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveBrand(@Body() body: any) {
    return this.catalogService.saveBrand(body);
  }

  // Products
  @Get('products')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getProducts() {
    return this.catalogService.getProducts();
  }

  @Post('products')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveProduct(@Body() body: any) {
    return this.catalogService.saveProduct(body);
  }

  @Patch('products/:id/stock')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async updateStock(@Param('id') id: string, @Body() body: { stock: number }) {
    return this.catalogService.updateStock(id, body.stock);
  }

  @Delete('products/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct(id);
  }

  // Warehouses & Stock
  @Get('warehouses')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getWarehouses() {
    return this.catalogService.getWarehouses();
  }

  @Post('warehouses')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveWarehouse(@Body() body: any) {
    return this.catalogService.saveWarehouse(body);
  }

  @Delete('warehouses/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deleteWarehouse(@Param('id') id: string) {
    return this.catalogService.deleteWarehouse(id);
  }

  @Get('warehouses/stock')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getWarehouseStock(@Query('warehouse_id') warehouseId?: string) {
    return this.catalogService.getWarehouseStock(warehouseId);
  }

  @Patch('warehouses/stock')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async updateProductWarehouseStock(@Body() body: { productId: string; warehouseId: string; quantity: number }) {
    return this.catalogService.updateProductWarehouseStock(body.productId, body.warehouseId, body.quantity);
  }

  // Orders
  @Get('orders')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getOrders() {
    return this.catalogService.getOrders();
  }

  // Customer Checkout (Public)
  @Post('orders')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveOrder(@Body() body: any) {
    return this.catalogService.saveOrder(body);
  }

  @Patch('orders/:id/status')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.catalogService.updateOrderStatus(id, body.status);
  }

  @Delete('orders/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deleteOrder(@Param('id') id: string) {
    return this.catalogService.deleteOrder(id);
  }

  @Delete('orders')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async clearAllOrders() {
    return this.catalogService.clearAllOrders();
  }

  // Settings (Admin Protected)
  @Get('settings')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getSettings() {
    return this.catalogService.getSettings();
  }

  @Post('settings')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveSettings(@Body() body: any) {
    return this.catalogService.saveSettings(body);
  }

  // Banners (Admin Protected)
  @Get('banners')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getBanners() {
    return this.catalogService.getBanners();
  }

  @Post('banners')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveBanners(@Body() body: any) {
    return this.catalogService.saveBanners(body);
  }

  // Stores
  @Get('stores')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getStores() {
    return this.catalogService.getStores();
  }

  @Post('stores')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveStores(@Body() body: any) {
    return this.catalogService.saveStores(body);
  }

  // Coupons
  @Get('coupons')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getCoupons() {
    return this.catalogService.getCoupons();
  }

  @Post('coupons')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveCoupons(@Body() body: any) {
    return this.catalogService.saveCoupons(body);
  }

  // Reviews
  @Get('reviews')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getReviews() {
    return this.catalogService.getReviews();
  }

  // Customer Review Submission (Public)
  @Post('reviews')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveReviews(@Body() body: any) {
    return this.catalogService.saveReviews(body);
  }

  // FAQs
  @Get('faqs')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getFaqs() {
    return this.catalogService.getFaqs();
  }

  @Post('faqs')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveFaqs(@Body() body: any) {
    return this.catalogService.saveFaqs(body);
  }

  // Affiliates
  @Get('affiliates')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getAffiliates() {
    return this.catalogService.getAffiliates();
  }

  @Post('affiliates')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveAffiliates(@Body() body: any) {
    return this.catalogService.saveAffiliates(body);
  }

  // Media Gallery
  @Get('media')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getMedia() {
    return this.catalogService.getMedia();
  }

  @Post('media')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveMedia(@Body() body: any) {
    return this.catalogService.saveMedia(body);
  }

  @Delete('media/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deleteMedia(@Param('id') id: string) {
    return this.catalogService.deleteMedia(id);
  }

  // YouTube Videos
  @Get('videos')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getVideos() {
    return this.catalogService.getVideos();
  }

  @Post('videos')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveVideos(@Body() body: any) {
    return this.catalogService.saveVideos(body);
  }

  // News Articles
  @Get('news')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getNews() {
    return this.catalogService.getNews();
  }

  @Get('news/:slug')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getNewsBySlug(@Param('slug') slug: string) {
    return this.catalogService.getNewsBySlug(slug);
  }

  @Post('news')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveNews(@Body() body: any) {
    return this.catalogService.saveNews(body);
  }

  @Delete('news/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deleteNews(@Param('id') id: string) {
    return this.catalogService.deleteNews(id);
  }

  // Newsletter Subscribers
  @Get('subscribers')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getSubscribers() {
    return this.catalogService.getSubscribers();
  }

  // Customer Newsletter Subscription (Public)
  @Post('subscribers')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async addSubscriber(@Body() body: { email: string }) {
    return this.catalogService.addSubscriber(body.email);
  }

  @Delete('subscribers/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deleteSubscriber(@Param('id') id: string) {
    return this.catalogService.deleteSubscriber(id);
  }

  // Legal Documents
  @Get('legal')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getLegalDocuments() {
    return this.catalogService.getLegalDocuments();
  }

  @Get('legal/:slug')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getLegalDocumentBySlug(@Param('slug') slug: string) {
    return this.catalogService.getLegalDocumentBySlug(slug);
  }

  @Post('legal')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveLegalDocument(@Body() body: any) {
    return this.catalogService.saveLegalDocument(body);
  }

  // Homepage Layout
  @Get('homepage-layout')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getHomepageLayout() {
    return this.catalogService.getHomepageLayout();
  }

  @Post('homepage-layout')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveHomepageLayout(@Body() body: any) {
    return this.catalogService.saveHomepageLayout(body);
  }

  // Feature Badges
  @Get('badges')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getBadges() {
    return this.catalogService.getBadges();
  }

  @Post('badges')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveBadges(@Body() body: any) {
    return this.catalogService.saveBadges(body);
  }

  // Customers
  @Get('customers')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getCustomers() {
    return this.catalogService.getCustomers();
  }

  @Post('customers')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveCustomer(@Body() body: any) {
    return this.catalogService.saveCustomer(body);
  }

  @Delete('customers/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deleteCustomer(@Param('id') id: string) {
    return this.catalogService.deleteCustomer(id);
  }

  // POS Sales
  @Get('pos/sales')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getPosSales() {
    return this.catalogService.getPosSales();
  }

  @Post('pos/sales')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async savePosSale(@Body() body: any) {
    return this.catalogService.savePosSale(body);
  }

  // Services
  @Get('services')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getServices() {
    return this.catalogService.getServices();
  }

  @Post('services')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveServices(@Body() body: any) {
    return this.catalogService.saveServices(Array.isArray(body) ? body : [body]);
  }

  @Delete('services/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deleteService(@Param('id') id: string) {
    return this.catalogService.deleteService(id);
  }

  // Suppliers
  @Get('suppliers')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getSuppliers() {
    return this.catalogService.getSuppliers();
  }

  @Post('suppliers')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveSupplier(@Body() body: any) {
    return this.catalogService.saveSupplier(body);
  }

  @Delete('suppliers/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deleteSupplier(@Param('id') id: string) {
    return this.catalogService.deleteSupplier(id);
  }

  // Purchase Invoices
  @Get('purchases/invoices')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getPurchaseInvoices() {
    return this.catalogService.getPurchaseInvoices();
  }

  @Post('purchases/invoices')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async savePurchaseInvoice(@Body() body: any) {
    return this.catalogService.savePurchaseInvoice(body);
  }

  @Delete('purchases/invoices/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deletePurchaseInvoice(@Param('id') id: string) {
    return this.catalogService.deletePurchaseInvoice(id);
  }

  // Warehouse Transfers
  @Get('purchases/transfers')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getTransfers() {
    return this.catalogService.getTransfers();
  }

  @Post('purchases/transfers')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveTransfer(@Body() body: any) {
    return this.catalogService.saveTransfer(body);
  }

  @Patch('purchases/transfers/:id/status')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async updateTransferStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.catalogService.updateTransferStatus(id, body.status);
  }

  // ═══════════════════════════════════════════════════
  // AUDIT LOGS (Immutable Security Journal)
  // ═══════════════════════════════════════════════════
  @Post('audit-logs')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async createAuditLog(@Body() body: any) {
    return this.catalogService.createAuditLog(body);
  }

  @Get('audit-logs')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getAuditLogs(
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('entity_type') entity_type?: string,
    @Query('user_name') user_name?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.catalogService.getAuditLogs({
      search,
      action,
      entity_type,
      user_name,
      startDate,
      endDate,
      limit,
      offset,
    });
  }

  @Get('audit-logs/stats')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getAuditLogStats() {
    return this.catalogService.getAuditLogStats();
  }

  // ═══════════════════════════════════════════════════
  // CUSTOMER AUTH & PROFILE (Public & Authenticated)
  // ═══════════════════════════════════════════════════
  @Post('customer/register')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async registerCustomer(@Body() body: any) {
    return this.catalogService.registerCustomer(body);
  }

  @Post('customer/login')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async loginCustomer(@Body() body: any) {
    return this.catalogService.loginCustomer(body);
  }

  @Post('customer/update-profile')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async updateCustomerProfile(@Body() body: any) {
    return this.catalogService.updateCustomerProfile(body);
  }

  @Post('customer/change-password')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async changeCustomerPassword(@Body() body: any) {
    return this.catalogService.changeCustomerPassword(body);
  }

  // ═══════════════════════════════════════════════════
  // CUSTOMER PRIVILEGES (İMTİYAZLAR)
  // ═══════════════════════════════════════════════════
  @Get('privileges')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getPrivileges() {
    return this.catalogService.getPrivileges();
  }

  @Post('privileges')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async savePrivilege(@Body() body: any) {
    return this.catalogService.savePrivilege(body);
  }

  @Delete('privileges/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deletePrivilege(@Param('id') id: string) {
    return this.catalogService.deletePrivilege(id);
  }

  // ═══════════════════════════════════════════════════
  // CUSTOMER NOTIFICATIONS (BİLDİRİŞLƏR)
  // ═══════════════════════════════════════════════════
  @Get('notifications')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getNotifications() {
    return this.catalogService.getCustomerNotifications();
  }

  @Post('notifications')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveNotification(@Body() body: any) {
    return this.catalogService.saveCustomerNotification(body);
  }

  @Delete('notifications/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deleteNotification(@Param('id') id: string) {
    return this.catalogService.deleteCustomerNotification(id);
  }

  // ═══════════════════════════════════════════════════
  // ERP INTERNAL STAFF NOTIFICATIONS
  // ═══════════════════════════════════════════════════
  @Get('erp-notifications')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getErpNotifications() {
    return this.catalogService.getErpNotifications();
  }

  @Post('erp-notifications')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveErpNotification(@Body() body: any) {
    return this.catalogService.saveErpNotification(body);
  }

  @Delete('erp-notifications/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deleteErpNotification(@Param('id') id: string) {
    return this.catalogService.deleteErpNotification(id);
  }

  // ═══════════════════════════════════════════════════
  // MOBILE APP STORIES (HEKAYƏLƏR)
  // ═══════════════════════════════════════════════════
  @Get('mobile-stories')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getMobileStories() {
    return this.catalogService.getMobileStories();
  }

  @Post('mobile-stories')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveMobileStory(@Body() body: any) {
    return this.catalogService.saveMobileStory(body);
  }

  @Delete('mobile-stories/:id')
  @UseGuards(AdminApiKeyGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async deleteMobileStory(@Param('id') id: string) {
    return this.catalogService.deleteMobileStory(id);
  }

  // ═══════════════════════════════════════════════════
  // CUSTOMER FEEDBACKS & SUGGESTIONS
  // ═══════════════════════════════════════════════════
  @Get('feedbacks')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getFeedbacks() {
    return this.catalogService.getFeedbacks();
  }

  @Post('feedbacks')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async saveFeedback(@Body() body: any) {
    return this.catalogService.saveFeedback(body);
  }
}

