import React, { createContext, useContext, useEffect, useState } from 'react';
const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from './useGlobalVariables';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import * as Yup from 'yup';

let schemaValidationForm = Yup.object().shape({
	email: Yup.string().email('E-mail inválido :(').required('E-mail vazio -_- ai fica difícil kkkk'),
	password: Yup.string()
		.required('Senha é obrigatória!')
		.min(6, 'A senha deve ter no mínimo 6 caracteres')
		.max(16, 'A senha deve ter no máximo 16 caracteres'),
});

const AuthContext = createContext({});
const USER_AUTH_DATA_KEY = '@fulloc-metal:user_id';

export const AuthProvider = ({ children }) => {
	const [userAuth, setUserAuth] = useState(false);
	const { setIsLoading, showError } = useGlobalContext();

	const signInWithFirebase = async (email, password) => {
		try {
			setIsLoading(true);
			await schemaValidationForm.validate({ email, password });
			const auth = getAuth();
			signInWithEmailAndPassword(auth, email, password)
				.then(async (userCredential) => {
					// Signed in
					const userInfo = userCredential.user;
					const userLogged = {
						id: userInfo.uid,
						name: userInfo.providerData[0].displayName,
						email: userInfo.email,
						photo: userInfo.providerData[0].photoURL,
					};
					setUserAuth(userLogged);
					await AsyncStorage.setItem(USER_AUTH_DATA_KEY, JSON.stringify(userLogged));
					setIsLoading(false);
				})
				.catch((error) => {
					setIsLoading(false);
					const errorCode = error.code;
					if (errorCode === 'auth/user-not-found') {
						showError('Usuário não encontrado, por favor, crie sua conta gratuitamente');
					}
					if (errorCode === 'auth/wrong-password') {
						showError('Dados inválidos');
					}
					// console.log('errorCode', errorCode);
					const errorMessage = error.message;
					showError(errorMessage.message);
				});
		} catch (error) {
			setIsLoading(false);

			if (error.name === 'ValidationError') {
				return showError(error.message);
			}
		}
	};

	const signInWithGoogle = async () => {
		try {
			// ! para forçar resultados
			// return setUserAuth({
			// 	email: 'igorlamoia@gmail.com',
			// 	id: '111726507287804207795',
			// 	name: 'Igor',
			// 	photo: 'https://lh3.googleusercontent.com/a-/AOh14GgJTxT9IUabvXLYwvYA6Djvf2CUAffr-DqwqqKhFiE=s96-c',
			// });
			setIsLoading(true);
			const RESPONSE_TYPE = 'token';
			const SCOPE = encodeURI('profile email');

			const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

			const { type, params } = await AuthSession.startAsync({ authUrl });
			if (type === 'success') {
				const response = await fetch(
					`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`
				);
				const userInfo = await response.json();
				const userLogged = {
					id: userInfo.id,
					name: userInfo.given_name,
					email: userInfo.email,
					photo: userInfo.picture,
				};
				if (!userLogged.id) {
					throw Error('Falha ao conectar com conta google, por favor, tente novamente!');
				}
				setIsLoading(false);

				setUserAuth(userLogged);
				await AsyncStorage.setItem(USER_AUTH_DATA_KEY, JSON.stringify(userLogged));
			}
		} catch (error) {
			showError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	const automaticLogin = async () => {
		setIsLoading(true);
		try {
			let user_data = await AsyncStorage.getItem(USER_AUTH_DATA_KEY);
			if (!!user_data) {
				user_data = JSON.parse(user_data);
				return setUserAuth(user_data);
			}
		} catch (erro) {
			// console.log(erro);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		automaticLogin();
	}, []);

	const LogOut = async () => {
		const auth = getAuth();
		const user = auth.currentUser;
		if (!!user) {
			signOut(auth)
				.then(() => {
					// Sign-out successful.
				})
				.catch((error) => {
					showError('Falha ao sair');
					// An error happened.
				});
		}

		setUserAuth(false);
		await AsyncStorage.removeItem(USER_AUTH_DATA_KEY);
	};

	return (
		<AuthContext.Provider
			value={{
				signInWithGoogle,
				userAuth,
				LogOut,
				setUserAuth,
				signInWithFirebase,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
export const useAuthContext = () => {
	return useContext(AuthContext);
};
