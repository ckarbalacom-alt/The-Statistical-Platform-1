<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key','value','type','group'];

    private static array $cache = [];

    public static function get(string $key, mixed $default = null): mixed
    {
        if (isset(self::$cache[$key])) return self::$cache[$key];

        $row = static::where('key', $key)->first();
        if (!$row) return $default;

        $value = match($row->type) {
            'json'    => json_decode($row->value, true),
            'boolean' => filter_var($row->value, FILTER_VALIDATE_BOOLEAN),
            'number'  => (float)$row->value,
            default   => $row->value,
        };

        return self::$cache[$key] = $value;
    }

    public static function set(string $key, mixed $value): void
    {
        $strValue = is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : (string)$value;
        static::updateOrCreate(['key' => $key], ['value' => $strValue]);
        self::$cache[$key] = $value;
    }

    public static function group(string $group): array
    {
        return static::where('group', $group)
            ->get()
            ->mapWithKeys(fn($s) => [$s->key => $s->value])
            ->toArray();
    }
}
