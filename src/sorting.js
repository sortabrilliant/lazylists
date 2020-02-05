/**
 * WordPress dependencies
 */
import { BlockControls } from '@wordpress/block-editor';
import { Toolbar, ToolbarButton } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { dispatch } from '@wordpress/data';

const convertListItemsToArray = ( items ) => {
	const parser = new DOMParser();
	const list = parser
		.parseFromString( items, 'text/html' )
		.querySelector( 'ul, ol' );

	return [ ...list.children ]
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
					items: convertListItemsToArray( li.innerHTML ),
					type,
				};
			}

			return li.innerHTML;
		} )
		.sort();
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
	const sortedItems = convertListItemsToArray( `<ul>${ values }</ul>` );

	if ( ! sortedItems.length ) {
		return;
	}

	dispatch( 'core/block-editor' ).updateBlockAttributes( clientId, {
		values: convertArrayToListItems( sortedItems ),
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
							icon="editor-unlink"
							title="Sort"
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
