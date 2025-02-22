import { RectButton } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';
import styled, { css } from 'styled-components/native';

export const Container = styled(RectButton)`
	/* flex: 1; */
	height: ${RFValue(56)}px;
	align-items: center;
	background-color: white;
	text-align: center;
	justify-content: space-between;
	flex-direction: row;
	border-radius: 5px;
	width: 100%;
	padding: 0 20px;
	margin-bottom: 10px;
`;

export const Content = styled.View`
	flex: 1;
	flex-direction: row;
	justify-content: center;
`;

export const LogoWrapper = styled.View`
	border-right-width: 2px;
	border-right-color: ${({ theme }) => theme.colors.border_login};
	height: 100%;
	justify-content: center;
	padding-right: 20px;
`;

export const Title = styled.Text`
	color: ${({ theme }) => theme.colors.title};
	font-family: ${({ theme }) => theme.fonts.secondary_500};
	font-size: ${RFValue(12)}px;
	text-align: center;
	${({ isLoading }) =>
		isLoading &&
		css`
			margin-left: 8px;
		`};
`;
