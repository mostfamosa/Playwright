export interface MenuPopupItem {
    label: string;
    href?: string;
    active?: boolean;
    onClick?: () => void;
}