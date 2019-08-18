'use babel';

import { CompositeDisposable } from 'atom';

export default 
{
  subscriptions: null,

  activate(state) 
  {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add (atom.commands.add('atom-workspace', { 'recursive-folding-toggle:toggle': () => this.toggle() }));
  },

  deactivate() 
  {
    this.subscriptions.dispose();
  },

  toggle() 
  {
    const oEditor = atom.workspace.getActiveTextEditor();
    const iRow = oEditor.getCursorBufferPosition().row;  
    
    // if we’re at already at level 0 and can’t indent directly, don’t even try doing anything smart
    if ( !oEditor.isFoldableAtBufferRow( iRow ) && ( oEditor.indentationForBufferRow( iRow ) === 0 ))
    {
      return;
    }
    
    // get start point
    const iStart = this._getFoldingStartPoint( oEditor, iRow );
    if ( iStart === null )
    {
      return;
    }
    
    // get the end point
    const iEnd = this._getFoldingEndPoint( oEditor, iStart );
    if ( iEnd === null )
    {
      return;
    }
        
    // get fold state, and do so!
    if ( oEditor.isFoldedAtBufferRow( iStart ))
    {
      this._unfoldRange( oEditor, ( iStart - 1 ), ( iEnd - 1 ));
    }
    else
    {
      this._foldRange( oEditor, ( iStart - 1 ), ( iEnd - 1 ));
    }
  },
  
  _getFoldingStartPoint( oEditor, iRow )
  {
    // if we’re currently foldable, just bail
    if ( oEditor.isFoldableAtBufferRow( iRow ))
    {
      return iRow;
    }
    
    // if not, find our containing level and work back until we can find something that can be folded
    const iLevel = Math.max( 0, oEditor.indentationForBufferRow( iRow ) - 1 );
    while ( --iRow > 0 )
    {
      if (( oEditor.indentationForBufferRow( iRow ) === iLevel ) && oEditor.isFoldableAtBufferRow( iRow ))
      {
        return iRow;
      }
    }
    
    return null;
  },
  
  _getFoldingEndPoint( oEditor, iRow )
  {
    // get the desired level
    const iLevel = oEditor.indentationForBufferRow( iRow );
    const iMax = oEditor.getLineCount();
    
    // start looking
    while ( ++iRow <= iMax )
    {
      if (( oEditor.indentationForBufferRow( iRow ) === iLevel ) && oEditor.isFoldableAtBufferRow( iRow ))
      {
        return iRow;
      }  
    }
    
    return null;
  },
  
  _unfoldRange( oEditor, iStart, iEnd )
  {
    for ( let i = iEnd; i > iStart; i-- )
    {
      if ( oEditor.isFoldableAtBufferRow( i ) && oEditor.isFoldedAtBufferRow( i ))
      {
        oEditor.unfoldBufferRow( i );
      }
    }
  },
  
  _foldRange( oEditor, iStart, iEnd )
  {
    for ( let i = iEnd; i > iStart; i-- )
    {
      if ( oEditor.isFoldableAtBufferRow( i ) && !oEditor.isFoldedAtBufferRow( i ))
      {
        oEditor.foldBufferRow( i );
      }
    }
  }
};
