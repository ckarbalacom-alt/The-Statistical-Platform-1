<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\CategoriesController;
use App\Http\Controllers\Api\PublicationsController;
use App\Http\Controllers\Api\IndicatorsController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\StatisticalRequestsController;
use App\Http\Controllers\Api\SiteMapController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\PublicationsController as AdminPublicationsController;
use App\Http\Controllers\Api\Admin\IndicatorsController as AdminIndicatorsController;
use App\Http\Controllers\Api\Admin\NewsController as AdminNewsController;
use App\Http\Controllers\Api\Admin\RequestsController;
use App\Http\Controllers\Api\Admin\UsersController;
use App\Http\Controllers\Api\Admin\SettingsController;
use App\Http\Controllers\Api\Admin\ReportsController;
use App\Http\Controllers\Api\Admin\CategoriesController as AdminCategoriesController;
use App\Http\Controllers\Api\Admin\CategoryPagesController as AdminCategoryPagesController;

// ─── Public Routes ───────────────────────────────────────────────────────────

Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);

Route::get('/home/stats',      [HomeController::class, 'stats']);
Route::get('/settings/public', [HomeController::class, 'publicSettings']);

Route::get('/categories',      [CategoriesController::class, 'index']);
Route::get('/categories/tree', [CategoriesController::class, 'tree']);

Route::get('/publications',              [PublicationsController::class, 'index']);
Route::get('/publications/featured',     [PublicationsController::class, 'featured']);
Route::get('/publications/{id}',         [PublicationsController::class, 'show']);
Route::get('/publications/{id}/download',[PublicationsController::class, 'download']);

Route::get('/indicators',                    [IndicatorsController::class, 'index']);
Route::get('/indicators/{id}',               [IndicatorsController::class, 'show']);
Route::get('/indicators/{id}/chart-data',    [IndicatorsController::class, 'chartData']);

Route::get('/news',          [NewsController::class, 'index']);
Route::get('/news/featured', [NewsController::class, 'featured']);
Route::get('/news/{id}',     [NewsController::class, 'show']);

Route::get('/calendar',          [CalendarController::class, 'index']);
Route::get('/calendar/upcoming', [CalendarController::class, 'upcoming']);

Route::post('/statistical-requests', [StatisticalRequestsController::class, 'store']);

Route::get('/site-map', [SiteMapController::class, 'index']);
Route::get('/sections/{slug}', [SiteMapController::class, 'show']);

// ─── Authenticated Routes ─────────────────────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // ─── Admin Routes ────────────────────────────────────────────────────────
    Route::prefix('admin')->group(function () {

        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Categories
        Route::get('/categories/tree', [AdminCategoriesController::class, 'tree']);
        Route::get('/categories', [AdminCategoriesController::class, 'index']);
        Route::post('/categories', [AdminCategoriesController::class, 'store']);
        Route::get('/categories/{id}', [AdminCategoriesController::class, 'show']);
        Route::put('/categories/{id}', [AdminCategoriesController::class, 'update']);
        Route::delete('/categories/{id}', [AdminCategoriesController::class, 'destroy']);
        Route::patch('/categories/{id}/toggle-active', [AdminCategoriesController::class, 'toggleActive']);

        // Category publishing
        Route::get('/category-pages', [AdminCategoryPagesController::class, 'index']);
        Route::get('/category-pages/by-category/{categoryId}', [AdminCategoryPagesController::class, 'showByCategory']);
        Route::post('/category-pages', [AdminCategoryPagesController::class, 'save']);

        // Publications
        Route::get('/publications',       [AdminPublicationsController::class, 'index']);
        Route::post('/publications',      [AdminPublicationsController::class, 'store']);
        Route::get('/publications/{id}',  [AdminPublicationsController::class, 'show']);
        Route::post('/publications/{id}', [AdminPublicationsController::class, 'update']);
        Route::delete('/publications/{id}', [AdminPublicationsController::class, 'destroy']);

        // Indicators
        Route::get('/indicators',       [AdminIndicatorsController::class, 'index']);
        Route::post('/indicators',      [AdminIndicatorsController::class, 'store']);
        Route::get('/indicators/{id}',  [AdminIndicatorsController::class, 'show']);
        Route::put('/indicators/{id}',  [AdminIndicatorsController::class, 'update']);
        Route::delete('/indicators/{id}', [AdminIndicatorsController::class, 'destroy']);
        Route::post('/indicators/{id}/data-points',             [AdminIndicatorsController::class, 'storeDataPoint']);
        Route::delete('/indicators/{id}/data-points/{dpId}',    [AdminIndicatorsController::class, 'destroyDataPoint']);

        // News
        Route::get('/news',       [AdminNewsController::class, 'index']);
        Route::post('/news',      [AdminNewsController::class, 'store']);
        Route::get('/news/{id}',  [AdminNewsController::class, 'show']);
        Route::post('/news/{id}', [AdminNewsController::class, 'update']);
        Route::put('/news/{id}',  [AdminNewsController::class, 'update']);
        Route::delete('/news/{id}', [AdminNewsController::class, 'destroy']);

        // Statistical Requests
        Route::get('/statistical-requests',          [RequestsController::class, 'index']);
        Route::get('/statistical-requests/{id}',     [RequestsController::class, 'show']);
        Route::patch('/statistical-requests/{id}/status', [RequestsController::class, 'updateStatus']);

        // Users
        Route::get('/users',              [UsersController::class, 'index']);
        Route::post('/users',             [UsersController::class, 'store']);
        Route::get('/users/{id}',         [UsersController::class, 'show']);
        Route::put('/users/{id}',         [UsersController::class, 'update']);
        Route::delete('/users/{id}',      [UsersController::class, 'destroy']);
        Route::patch('/users/{id}/toggle-active', [UsersController::class, 'toggleActive']);

        // Settings
        Route::get('/settings',  [SettingsController::class, 'index']);
        Route::post('/settings', [SettingsController::class, 'update']);

        // Reports
        Route::get('/reports',               [ReportsController::class, 'index']);
        Route::get('/reports/export/{type}', [ReportsController::class, 'exportByType']);
    });
});
