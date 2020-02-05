/**
 * External dependencies
 */
import { assign } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';

const addLayoutSettings = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const {
			name,
			isSelected,
			attributes: { columns },
			setAttributes,
		} = props;

		if ( name !== 'core/list' || ! isSelected ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody title={ __( 'Layout Settings', 'lazy-lists' ) }>
						<RangeControl
							label={ __( 'Columns', 'lazy-lists' ) }
							value={ columns || 1 }
							onChange={ ( newColumns ) => {
								setAttributes( { columns: newColumns } );
							} }
							min={ 1 }
							max={ 5 }
						/>
					</PanelBody>
				</InspectorControls>
			</>
		);
	};
}, 'addLayoutSettings' );

const addColumnsClassToEditor = createHigherOrderComponent(
	( BlockListBlock ) => {
		return ( props ) => {
			const {
				name,
				block: {
					attributes: { columns },
				},
			} = props;

			if ( name !== 'core/list' ) {
				return <BlockListBlock { ...props } />;
			}

			return (
				<BlockListBlock
					{ ...props }
					className={ `wp-block-list--${ columns }-columns` }
				/>
			);
		};
	},
	'addColumnsClassToEditor',
);

const addColumnsAttribute = ( settings ) => {
	// If this is a valid block
	if ( settings.name !== 'core/list' ) {
		return settings;
	}

	// Use Lodash's assign to gracefully handle if attributes are undefined
	settings.attributes = assign( settings.attributes, {
		columns: {
			type: 'number',
			default: 1,
		},
	} );

	return settings;
};

const addColumnsProp = ( props, blockType, attributes ) => {
	if ( blockType.name !== 'core/list' ) {
		return props;
	}

	return assign( props, {
		class: `wp-block-list--${ attributes.columns }-columns`,
	} );
};

export default () => {
	addFilter(
		'editor.BlockEdit',
		'sorta-brilliant/lazy-lists',
		addLayoutSettings,
	);

	addFilter(
		'editor.BlockListBlock',
		'sorta-brilliant/lazy-lists',
		addColumnsClassToEditor,
	);

	addFilter(
		'blocks.registerBlockType',
		'sorta-brilliant/lazy-lists',
		addColumnsAttribute,
	);

	addFilter(
		'blocks.getSaveContent.extraProps',
		'sorta-brilliant/lazy-lists',
		addColumnsProp,
	);
};
