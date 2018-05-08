package com.gdmu.graduation.bookhouse.webapps.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {

    /**
     * 登录的处理方法
     * @return
     */
    @RequestMapping(value= {"/login"})
    public String login(){
        return "tset redict page";
    }

    /*public String login(HttpServletRequest request, RedirectAttributes model) {
        // 判断是否登录出错
        String exceptionClazz = (String) request.getAttribute(FormAuthenticationFilter.DEFAULT_ERROR_KEY_ATTRIBUTE_NAME);
        HttpSession session = request.getSession();

        String sub = null;  //sign of change language submit
        *//**
         * judge the url submit
         *//*
        if((request.getRequestURL().indexOf("login"))!=-1){
            lang=request.getParameter("lang");
            sub = request.getParameter("submitval");
            if(lang!=null){
                session.setAttribute("lang",lang);
            }
        }else if(session.getAttribute("lang")!=null){
            lang =(String)session.getAttribute("lang");
            session.setAttribute("lang",lang);

        }else{
            lang="en_US";
            session.setAttribute("lang",lang);
        }
        *//**
         * judge the method of submit and get diffrent types of the error
         *//*
        if(sub!=null&&!sub.equals("changelang")){
            if (!StringUtils.isEmpty(exceptionClazz)) {//TODO 加入国际化后更改
                if (LockedAccountException.class.getName().equals(exceptionClazz)) {
                    model.addFlashAttribute(LOGIN_ERROR_ATTR, "用户被锁定");
                } else if (UnknownAccountException.class.getName().equals(exceptionClazz)) {
                    model.addFlashAttribute(LOGIN_ERROR_ATTR, "用户不存在");
                } else if (IncorrectCredentialsException.class.getName().equals(exceptionClazz)) {
                    model.addFlashAttribute(LOGIN_ERROR_ATTR, "用户名或密码错误");
                } else {
                    model.addFlashAttribute(LOGIN_ERROR_ATTR, "未知错误");
                }
                return "redirect:/login?lang="+lang;
            }
        }
        // 如果用户直接到登录页面 先退出一下
        //原因：AuthenticationFilter.isAccessAllowed的实现是subject.isAuthenticated()，即如果用户验证通过 就允许访问这样会导致登录一直死循环
        Subject subject = SecurityUtils.getSubject();
        if (subject != null && subject.isAuthenticated()) {
            subject.logout();
        }
        return "login";
    }*/


}
