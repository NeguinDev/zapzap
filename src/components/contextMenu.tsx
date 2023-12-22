import React, { useEffect, useRef, useState } from 'react';

type ItemsContextMenu = {
	name: string;
	onClick: () => void;
};

type ContextMenuProps = {
	itemsPopup: ItemsContextMenu[];
};