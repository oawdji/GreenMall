<template>
  <footer class="bg-gray-800 text-gray-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- 品牌 -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <span class="text-2xl">🌿</span>
            <span class="text-lg font-bold text-white">GreenMall</span>
          </div>
          <p class="text-sm text-gray-400 leading-relaxed">
            绿色、健康、品质生活。为您精选好物，让购物更简单。
          </p>
        </div>

        <!-- 购物指南 -->
        <div>
          <h4 class="text-white font-medium mb-3">购物指南</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white transition-colors">购物流程</a></li>
            <li><a href="#" class="hover:text-white transition-colors">支付方式</a></li>
            <li><a href="#" class="hover:text-white transition-colors">配送说明</a></li>
            <li><a href="#" class="hover:text-white transition-colors">售后服务</a></li>
          </ul>
        </div>

        <!-- 服务保障 -->
        <div>
          <h4 class="text-white font-medium mb-3">服务保障</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white transition-colors">正品保证</a></li>
            <li><a href="#" class="hover:text-white transition-colors">7天退换</a></li>
            <li><a href="#" class="hover:text-white transition-colors">隐私保护</a></li>
            <li><a href="#" class="hover:text-white transition-colors">投诉建议</a></li>
          </ul>
        </div>

        <!-- 关于我们 -->
        <div>
          <h4 class="text-white font-medium mb-3">关于我们</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white transition-colors">公司介绍</a></li>
            <li><a href="#" class="hover:text-white transition-colors">加入我们</a></li>
            <li><a href="#" class="hover:text-white transition-colors">联系我们</a></li>
            <li><a href="#" class="hover:text-white transition-colors">商务合作</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
        <p>&copy; {{ new Date().getFullYear() }} GreenMall. All rights reserved. 仅供学习交流使用。</p>
      </div>
    </div>
  </footer>
</template>
