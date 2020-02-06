<?php
/**
 * Plugin Name:     Lazy Lists
 * Description:     @todo
 * Version:         1.0.0
 * Author:          sorta brilliant
 * Author URI:      https://sortabrilliant.com/
 * License:         GPL-2.0-or-later
 * Text Domain:     lazy-lists
 */

namespace SortaBrilliant\LazyLists;

const VERSION = '1.0.0';

add_action( 'enqueue_block_editor_assets', function () {
	$asset_filepath = __DIR__ . '/build/index.asset.php';
	$asset_file = file_exists( $asset_filepath ) ? include $asset_filepath : [
		'dependencies' => [],
		'version'      => VERSION,
	];

	wp_enqueue_script(
		'lazy-lists-editor-script',
		plugins_url( 'build/index.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version']
	);

	wp_enqueue_style(
		'lazy-lists-editor-style',
		plugins_url( 'build/css/editor.css', __FILE__ ),
		[],
		VERSION
	);
} );

add_action( 'enqueue_block_assets', function () {
	if ( is_admin() ) {
		return;
	}

	wp_enqueue_style(
		'lazy-lists-style',
		plugins_url( 'build/css/style.css', __FILE__ ),
		[],
		VERSION
	);
} );
