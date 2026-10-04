import { useState } from "react";
import "./FeedbackForm.css";

function FeedbackForm() {
  // --- Значения полей ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [wantReply, setWantReply] = useState(false);

  // --- Ошибки валидации ---
  const [errors, setErrors] = useState({
    name: null,
    email: null,
    phone: null,
    message: null,
  });

  // --- "Тронутые" поля ---
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    message: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ---------- Валидаторы ----------
  const validateName = (value) => {
    if (!value.trim()) return "Имя обязательно для заполнения";
    if (value.trim().length < 2) return "Минимум 2 символа";
    if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value.trim()))
      return "Только буквы, пробелы и дефис";
    return null;
  };

  // required — хотим ли требовать email (зависит от wantReply).
  const validateEmail = (value, required = wantReply) => {
    if (!value.trim()) {
      return required ? "Email обязателен для заполнения" : null;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
      return "Некорректный формат email";
    return null;
  };

  const validatePhone = (value) => {
    if (!value.trim()) return "Телефон обязателен для заполнения";
    if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value.trim()))
      return "Формат: +7 (XXX) XXX-XX-XX";
    return null;
  };

  const validateMessage = (value) => {
    if (!value.trim()) return "Сообщение обязательно для заполнения";
    if (value.trim().length < 10) return "Минимум 10 символов";
    if (value.length > 500) return "Максимум 500 символов";
    return null;
  };

  const validators = {
    name: validateName,
    email: validateEmail,
    phone: validatePhone,
    message: validateMessage,
  };

  // ---------- Маска телефона: +7 (XXX) XXX-XX-XX ----------
  const formatPhone = (value) => {
    let digits = value.replace(/\D/g, ""); // только цифры
    if (digits.startsWith("7") || digits.startsWith("8")) {
      digits = digits.slice(1); // убираем код страны
    }
    digits = digits.slice(0, 10);
    if (digits.length === 0) return "";

    let result = "+7";
    if (digits.length > 0) result += " (" + digits.slice(0, 3);
    if (digits.length >= 3) result += ")";
    if (digits.length > 3) result += " " + digits.slice(3, 6);
    if (digits.length > 6) result += "-" + digits.slice(6, 8);
    if (digits.length > 8) result += "-" + digits.slice(8, 10);
    return result;
  };

  // ---------- Обработчик изменения ----------
  const handleChange = (field, rawValue) => {
    let value = rawValue;

    switch (field) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "phone":
        value = formatPhone(rawValue);
        setPhone(value);
        break;
      case "message":
        if (value.length > 500) value = value.slice(0, 500);
        setMessage(value);
        break;
      default:
        return;
    }

    // live-валидация для уже тронутых полей
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validators[field](value),
      }));
    }
  };

  // ---------- Обработчик blur ----------
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const currentValue = { name, email, phone, message }[field];
    setErrors((prev) => ({
      ...prev,
      [field]: validators[field](currentValue),
    }));
  };

  // ---------- Обработчик checkbox ----------
  const handleWantReply = (checked) => {
    setWantReply(checked);
    // Если поле email уже тронуто — пересчитываем ошибку с учётом нового правила
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(email, checked) }));
    }
  };

  // ---------- Отправка ----------
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      phone: validatePhone(phone),
      message: validateMessage(message),
    };

    setErrors(newErrors);
    setTouched({ name: true, email: true, phone: true, message: true });

    if (Object.values(newErrors).some((err) => err !== null)) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  // ---------- Динамический класс для инпута ----------
  const getInputClass = (field) => {
    const classes = ["field__input"];
    if (touched[field] && errors[field]) {
      classes.push("field__input--error");
    } else if (touched[field] && !errors[field]) {
      classes.push("field__input--valid");
    }
    if (field === "message") classes.push("field__input--textarea");
    return classes.join(" ");
  };

  // ---------- Экран успеха ----------
  if (submitted) {
    return (
      <div className="feedback-form feedback-form--success">
        <h2 className="feedback-form__title">Спасибо за обращение!</h2>
        <p className="feedback-form__text">
          Мы свяжемся с вами в ближайшее время.
        </p>
        <button
          type="button"
          className="feedback-form__submit"
          onClick={() => {
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
            setWantReply(false);
            setErrors({ name: null, email: null, phone: null, message: null });
            setTouched({ name: false, email: false, phone: false, message: false });
            setSubmitted(false);
          }}
        >
          Отправить ещё одно сообщение
        </button>
      </div>
    );
  }

  const messageLengthWarning = message.length >= 450 && message.length <= 500;

  return (
    <form className="feedback-form" onSubmit={handleSubmit} noValidate>
      {/* --- Имя --- */}
      <div className="field">
        <label htmlFor="name" className="field__label">Имя</label>
        <input
          id="name"
          type="text"
          className={getInputClass("name")}
          value={name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
        />
        {touched.name && errors.name && (
          <span className="field__error">{errors.name}</span>
        )}
      </div>

      {/* --- Email --- */}
      <div className="field">
        <label htmlFor="email" className="field__label">
          Email {wantReply && <span className="field__required">*</span>}
        </label>
        <input
          id="email"
          type="email"
          className={getInputClass("email")}
          value={email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
        />
        {touched.email && errors.email && (
          <span className="field__error">{errors.email}</span>
        )}
      </div>

      {/* --- Телефон --- */}
      <div className="field">
        <label htmlFor="phone" className="field__label">Телефон</label>
        <input
          id="phone"
          type="tel"
          className={getInputClass("phone")}
          value={phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          onBlur={() => handleBlur("phone")}
          placeholder="+7 (___) ___-__-__"
        />
        {touched.phone && errors.phone && (
          <span className="field__error">{errors.phone}</span>
        )}
      </div>

      {/* --- Сообщение + счётчик --- */}
      <div className="field">
        <label htmlFor="message" className="field__label">Сообщение</label>
        <textarea
          id="message"
          className={getInputClass("message")}
          value={message}
          onChange={(e) => handleChange("message", e.target.value)}
          onBlur={() => handleBlur("message")}
          rows={5}
          maxLength={500}
        />
        <div className="field__meta">
          {touched.message && errors.message ? (
            <span className="field__error">{errors.message}</span>
          ) : (
            <span />
          )}
          <span
            className={
              "field__counter" +
              (messageLengthWarning ? " field__counter--limit" : "")
            }
          >
            {message.length} / 500
          </span>
        </div>
      </div>

      {/* --- Чекбокс "Хочу получить ответ" --- */}
      <div className="field field--checkbox">
        <label className="field__checkbox-label">
          <input
            type="checkbox"
            checked={wantReply}
            onChange={(e) => handleWantReply(e.target.checked)}
          />
          <span>Хочу получить ответ</span>
        </label>
      </div>

      {/* --- Кнопка --- */}
      <button
        type="submit"
        className="feedback-form__submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Отправка..." : "Отправить"}
      </button>
    </form>
  );
}

export default FeedbackForm;