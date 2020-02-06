/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { BlockControls } from '@wordpress/block-editor';
import { Toolbar, ToolbarButton } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { SortIcon } from './icons';

const sortListItems = ( items, reverse = false ) => {
	const parser = new DOMParser();
	const list = parser
		.parseFromString( items, 'text/html' )
		.querySelector( 'ul, ol' );

	const sortedItems = [ ...list.children ]
		.map( ( li ) => {
			const hasChildUl = li.innerHTML.includes( '<ul>' );
			const hasChildOl = li.innerHTML.includes( '<ol>' );

			if ( hasChildUl || hasChildOl ) {
				const valueBeforeChildList = li.innerHTML.split(
					/(<ul>|<ol>)/g,
				)[ 0 ];

				const type =
					! hasChildUl ||
					( hasChildOl &&
						li.innerHTML.indexOf( '<ol>' ) <
							li.innerHTML.indexOf( '<ul>' ) )
						? 'ol'
						: 'ul';

				return {
					prefix: valueBeforeChildList,
					items: sortListItems( li.innerHTML, reverse ),
					type,
				};
			}

			return li.innerHTML;
		} )
		.sort();

	if ( reverse ) {
		return sortedItems.reverse();
	}

	return sortedItems;
};

const convertArrayToListItems = ( items ) =>
	items
		.map( ( item ) => {
			if ( typeof item === 'object' ) {
				return (
					`<li>${ item.prefix }<${ item.type }>` +
					convertArrayToListItems( item.items ) +
					`</${ item.type }></li>`
				);
			}

			return `<li>${ item }</li>`;
		} )
		.join( '' );

const sortList = ( { clientId, attributes: { values } } ) => {
	const sortedItems = sortListItems( `<ul>${ values }</ul>` );

	if ( ! sortedItems.length ) {
		return;
	}

	let convertedItems = convertArrayToListItems( sortedItems );

	if ( convertedItems === values ) {
		convertedItems = convertArrayToListItems(
			sortListItems( `<ul>${ values }</ul>`, true ),
		);
	}

	dispatch( 'core/block-editor' ).updateBlockAttributes( clientId, {
		values: convertedItems,
	} );
};

const addLayoutSettings = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const { name, isSelected } = props;

		if ( name !== 'core/list' || ! isSelected ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<>
				<BlockEdit { ...props } />
				<BlockControls>
					<Toolbar>
						<ToolbarButton
							icon={ SortIcon }
							title={ __( 'Sort alphabetically', 'lazy-lists' ) }
							onClick={ () => sortList( props ) }
						/>
					</Toolbar>
				</BlockControls>
			</>
		);
	};
}, 'addLayoutSettings' );

export default () => {
	addFilter(
		'editor.BlockEdit',
		'sorta-brilliant/lazy-lists',
		addLayoutSettings,
	);
};
