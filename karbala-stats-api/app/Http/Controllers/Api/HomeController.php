<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Indicator;
use App\Models\NewsArticle;
use App\Models\Publication;
use App\Models\Setting;
use App\Models\StatisticalCalendar;

class HomeController extends Controller
{
    public function stats()
    {
        return response()->json([
            'publications_count' => Publication::published()->count(),
            'indicators_count'   => Indicator::active()->count(),
            'categories_count'   => Category::active()->count(),
            'downloads_total'    => Publication::published()->sum('downloads_count'),
            'featured_publications' => \App\Http\Resources\PublicationResource::collection(
                Publication::with('category')->published()->orderByRaw('COALESCE(release_date, published_at, created_at) desc')->limit(6)->get()
            ),
            'featured_indicators' => \App\Http\Resources\IndicatorResource::collection(
                Indicator::with('category')->active()->featured()->limit(6)->get()
            ),
            'latest_news' => \App\Http\Resources\NewsArticleResource::collection(
                NewsArticle::with('author')->published()->orderByDesc('published_at')->limit(4)->get()
            ),
            'upcoming_calendar' => StatisticalCalendar::upcoming(14)->limit(5)->get()->map(fn($e) => [
                'id'           => $e->id,
                'title_ar'     => $e->title_ar,
                'release_date' => $e->release_date->format('Y-m-d'),
                'status'       => $e->status,
            ]),
            'settings' => [
                'site_name_ar' => Setting::get('site_name_ar'),
                'about_ar'     => Setting::get('about_ar'),
            ],
        ]);
    }

    public function publicSettings()
    {
        return response()->json([
            'site_name_ar'    => Setting::get('site_name_ar'),
            'site_name_en'    => Setting::get('site_name_en'),
            'about_ar'        => Setting::get('about_ar'),
            'contact_email'   => Setting::get('contact_email'),
            'contact_phone'   => Setting::get('contact_phone'),
            'contact_address' => Setting::get('contact_address'),
            'social_links'    => Setting::get('social_links'),
            'footer_text'     => Setting::get('footer_text'),
        ]);
    }
}
