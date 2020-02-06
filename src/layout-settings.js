/**
 * External dependencies
 */
import classnames from 'classnames';
import { assign } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';

const addLayoutSettings = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const {
			name,
			isSelected,
			attributes: { columns, showColumnsOnMobile },
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
						<ToggleControl
							label={ __(
								'Show columns on mobile',
								'lazy-lists',
							) }
							checked={ showColumnsOnMobile }
							onChange={ () =>
								setAttributes( {
									showColumnsOnMobile: ! showColumnsOnMobile,
								} )
							}
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

const addAttributes = ( settings ) => {
	// If this is a valid block
	if ( settings.name !== 'core/list' ) {
		return settings;
	}

	settings.attributes = assign( settings.attributes, {
		columns: {
			type: 'number',
			default: 1,
		},
		showColumnsOnMobile: {
			type: 'boolean',
			default: false,
		},
	} );

	return settings;
};

const addProps = ( props, blockType, { columns, showColumnsOnMobile } ) => {
	if ( blockType.name !== 'core/list' ) {
		return props;
	}

	const className = classnames( `wp-block-list--${ columns }-columns`, {
		'wp-block-list--show-columns-on-mobile': showColumnsOnMobile,
	} );

	return assign( props, {
		class: className,
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
		addAttributes,
	);

	addFilter(
		'blocks.getSaveContent.extraProps',
		'sorta-brilliant/lazy-lists',
		addProps,
	);
};
